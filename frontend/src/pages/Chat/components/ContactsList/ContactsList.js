import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import api from "../../../../util/api";
import openSocket from "socket.io-client";
import moment from "moment-timezone";

import profileDefaultPic from "../../../../Images/profile_default.png";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";

import ContactsHeader from "../ContactsHeader/ContactsHeader";

const useStyles = makeStyles(theme => ({
	contactsWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflow: "hidden",
	},

	contactsHeader: {
		display: "flex",
		backgroundColor: "#eee",
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
		borderTopRightRadius: 0,
	},

	settingsIcon: {
		alignSelf: "center",
		marginLeft: "auto",
		padding: 8,
	},

	contactsList: {
		borderTopLeftRadius: 0,
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
		flexGrow: 1,
		overflowY: "scroll",
		"&::-webkit-scrollbar": {
			width: "8px",
		},
		"&::-webkit-scrollbar-thumb": {
			boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
			backgroundColor: "#e8e8e8",
		},
	},
	contactsSearchBox: {
		background: "#fafafa",
		padding: "10px 13px",
	},

	serachInputWrapper: {
		background: "#fff",
		display: "flex",
		borderRadius: 40,
		padding: 4,
	},

	searchIcon: {
		color: "grey",
		marginLeft: 6,
		marginRight: 6,
		alignSelf: "center",
	},

	contactsSearchInput: {
		flex: 1,
		border: "none",
		borderRadius: 30,
	},

	contactNameWrapper: {
		display: "flex",
		// display: "inline",
	},

	lastMessageTime: {
		marginLeft: "auto",
	},

	contactLastMessage: {
		paddingRight: 20,
	},

	newMessagesCount: {
		alignSelf: "center",
		marginRight: 8,
		marginLeft: "auto",
	},

	badgeStyle: {
		color: "white",
		backgroundColor: green[500],
	},
}));

const ContactsList = ({ selectedContact, setSelectedContact }) => {
	const classes = useStyles();
	const token = localStorage.getItem("token");

	const [contacts, setContacts] = useState([]);
	const [displayedContacts, setDisplayedContacts] = useState([]);
	const [notification, setNotification] = useState(true);

	const history = useHistory();

	useEffect(() => {
		if (!("Notification" in window)) {
			console.log("Esse navegador não suporte notificações");
		} else {
			Notification.requestPermission();
		}
	}, []);

	useEffect(() => {
		const fetchContacts = async () => {
			try {
				const res = await api.get(
					"/contacts"
					// { headers: { Authorization: "Bearer " + token }, }
				);
				setContacts(res.data);
				setDisplayedContacts(res.data);
			} catch (err) {
				if (err) {
					console.log(err);
					alert(err);
				}
				console.log(err);
			}
		};
		fetchContacts();
	}, [token, notification, history]);

	useEffect(() => {
		const socket = openSocket("http://localhost:8080");

		socket.emit("joinNotification");

		socket.on("contact", data => {
			if (data.action === "updateUnread") {
				resetUnreadMessages(data.contactId);
			}
		});

		socket.on("appMessage", data => {
			setNotification(prevState => !prevState);
			if (
				selectedContact &&
				data.message.contactId === selectedContact.id &&
				document.visibilityState === "visible"
			) {
				return;
			}

			let contactImageUrl = profileDefaultPic;
			let contactName = "Novo Contato";

			const contactIndex = contacts.findIndex(
				contact => contact.id === data.message.contactId
			);

			if (contactIndex !== -1) {
				contactImageUrl = contacts[contactIndex].imageURL;
				contactName = contacts[contactIndex].name;
			}

			const options = {
				body: `${data.message.messageBody} - ${moment(new Date())
					.tz("America/Sao_Paulo")
					.format("DD/MM/YY - HH:mm")}`,
				icon: contactImageUrl,
			};
			new Notification(`Mensagem de ${contactName}`, options);
			document.getElementById("sound").play();
		});

		return () => {
			socket.disconnect();
		};
	}, [selectedContact, contacts]);

	const resetUnreadMessages = contactId => {
		setDisplayedContacts(prevState => {
			let aux = [...prevState];
			let contactIndex = aux.findIndex(contact => contact.id === +contactId);
			aux[contactIndex].unreadMessages = 0;

			return aux;
		});
	};

	const handleSelectContact = (e, contact) => {
		setSelectedContact(contact);
	};

	const handleSearchContact = e => {
		let searchTerm = e.target.value.toLowerCase();

		setDisplayedContacts(
			contacts.filter(contact =>
				contact.name.toLowerCase().includes(searchTerm)
			)
		);
	};

	return (
		<div className={classes.contactsWrapper}>
			<ContactsHeader />
			<Paper variant="outlined" square className={classes.contactsSearchBox}>
				<div className={classes.serachInputWrapper}>
					<SearchIcon className={classes.searchIcon} />
					<InputBase
						className={classes.contactsSearchInput}
						placeholder="Buscar contatos"
						type="search"
						onChange={handleSearchContact}
					/>
				</div>
			</Paper>
			<Paper variant="outlined" className={classes.contactsList}>
				<List>
					{displayedContacts.map((contact, index) => (
						<React.Fragment key={contact.id}>
							<ListItem
								button
								onClick={e => handleSelectContact(e, contact)}
								selected={selectedContact && selectedContact.id === contact.id}
							>
								<ListItemAvatar>
									<Avatar
										src={
											contact.imageURL ? contact.imageURL : profileDefaultPic
										}
									></Avatar>
								</ListItemAvatar>
								<ListItemText
									primary={
										<span className={classes.contactNameWrapper}>
											<Typography
												noWrap
												component="span"
												variant="body2"
												color="textPrimary"
											>
												{contact.name}
											</Typography>
											{contact.messages && contact.messages[0] && (
												<Typography
													className={classes.lastMessageTime}
													noWrap
													component="span"
													variant="body2"
													color="textSecondary"
												>
													{moment(contact.messages[0].createdAt)
														.tz("America/Sao_Paulo")
														.format("HH:mm")}
												</Typography>
											)}
										</span>
									}
									secondary={
										<span className={classes.contactNameWrapper}>
											<Typography
												className={classes.contactLastMessage}
												noWrap
												component="span"
												variant="body2"
												color="textSecondary"
											>
												{(contact.messages &&
													contact.messages[0] &&
													contact.messages[0].messageBody) || <br />}
											</Typography>
											{contact.unreadMessages > 0 && (
												<Badge
													className={classes.newMessagesCount}
													badgeContent={contact.unreadMessages}
													classes={{
														badge: classes.badgeStyle,
													}}
												/>
											)}
										</span>
									}
								/>
							</ListItem>
							<Divider variant="inset" component="li" />
						</React.Fragment>
					))}
				</List>
			</Paper>
			<audio id="sound" preload="auto">
				<source src={require("../../../../util/sound.mp3")} type="audio/mpeg" />
				<source src={require("../../../../util/sound.ogg")} type="audio/ogg" />
				<embed hidden={true} autostart="false" loop={false} src="./sound.mp3" />
			</audio>
		</div>
	);
};

export default ContactsList;
