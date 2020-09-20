// const Contact = require("../models/Contact");
// const Whatsapp = require("../models/Whatsapp");
// const { getIO } = require("../libs/socket");
// const { getWbot, initWbot } = require("../libs/wbot");

// exports.store = async (req, res, next) => {
//   const defaultWhatsapp = await Whatsapp.findOne({
//     where: { default: true }
//   });

//   if (!defaultWhatsapp) {
//     return res
//       .status(404)
//       .json({ error: "No default WhatsApp found. Check Connection page." });
//   }

//   const io = getIO();
//   const wbot = getWbot(defaultWhatsapp);

//   let phoneContacts;

//   try {
//     phoneContacts = await wbot.getContacts();
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       error: "Could not check whatsapp contact. Check connection page."
//     });
//   }

//   await Promise.all(
//     phoneContacts.map(async ({ number, name }) => {
//       await Contact.create({ number, name });
//     })
//   );

//   return res.status(200).json({ message: "contacts imported" });
// };
