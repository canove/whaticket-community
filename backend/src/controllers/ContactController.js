const Sequelize = require("sequelize");
const { Op } = require("sequelize");

const Contact = require("../models/Contact");
const ContactCustomField = require("../models/ContactCustomField");

const { getIO } = require("../libs/socket");
const { getWbot } = require("../libs/wbot");

exports.index = async (req, res) => {
	const { searchParam = "", pageNumber = 1, rowsPerPage = 10 } = req.query;

	const whereCondition = {
		[Op.or]: [
			{
				name: Sequelize.where(
					Sequelize.fn("LOWER", Sequelize.col("name")),
					"LIKE",
					"%" + searchParam.toLowerCase() + "%"
				),
			},
			{ number: { [Op.like]: `%${searchParam}%` } },
		],
	};

	let limit = +rowsPerPage;
	let offset = limit * (pageNumber - 1);

	const { count, rows: contacts } = await Contact.findAndCountAll({
		where: whereCondition,
		limit,
		offset,
		order: [["createdAt", "DESC"]],
	});

	return res.json({ contacts, count });
};

exports.store = async (req, res) => {
	const wbot = getWbot();
	const io = getIO();
	const newContact = req.body;

	let isValidNumber;

	try {
		isValidNumber = await wbot.isRegisteredUser(`${newContact.number}@c.us`);
	} catch (err) {
		console.log("Could not check whatsapp contact. Is session details valid?");
		return res.status(500).json({
			error: "Could not check whatsapp contact. Check connection page.",
		});
	}

	if (!isValidNumber) {
		return res
			.status(400)
			.json({ error: "The suplied number is not a valid Whatsapp number" });
	}

	const profilePicUrl = await wbot.getProfilePicUrl(
		`${newContact.number}@c.us`
	);

	const contact = await Contact.create(
		{ ...newContact, profilePicUrl },
		{
			include: "extraInfo",
		}
	);

	io.emit("contact", {
		action: "create",
		contact: contact,
	});

	res.status(200).json(contact);
};

exports.show = async (req, res) => {
	const { contactId } = req.params;

	const { id, name, number, email, extraInfo } = await Contact.findByPk(
		contactId,
		{
			include: "extraInfo",
		}
	);

	res.status(200).json({
		id,
		name,
		number,
		email,
		extraInfo,
	});
};

exports.update = async (req, res) => {
	const io = getIO();

	const updatedContact = req.body;

	const { contactId } = req.params;

	const contact = await Contact.findByPk(contactId, {
		include: "extraInfo",
	});

	if (!contact) {
		return res.status(400).json({ error: "No contact found with this ID" });
	}

	if (updatedContact.extraInfo) {
		await Promise.all(
			updatedContact.extraInfo.map(async info => {
				await ContactCustomField.upsert({ ...info, contactId: contact.id });
			})
		);

		await Promise.all(
			contact.extraInfo.map(async oldInfo => {
				let stillExists = updatedContact.extraInfo.findIndex(
					info => info.id === oldInfo.id
				);

				if (stillExists === -1) {
					await ContactCustomField.destroy({ where: { id: oldInfo.id } });
				}
			})
		);
	}

	await contact.update(updatedContact);

	io.emit("contact", {
		action: "update",
		contact: contact,
	});

	res.status(200).json(contact);
};

exports.delete = async (req, res) => {
	const io = getIO();
	const { contactId } = req.params;

	const contact = await Contact.findByPk(contactId);

	if (!contact) {
		return res.status(400).json({ error: "No contact found with this ID" });
	}

	await contact.destroy();

	io.emit("contact", {
		action: "delete",
		contactId: contactId,
	});

	res.status(200).json({ message: "Contact deleted" });
};
