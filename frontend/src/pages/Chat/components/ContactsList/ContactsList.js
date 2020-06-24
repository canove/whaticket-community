import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../../../util/api";
import openSocket from "socket.io-client";
import moment from "moment-timezone";

import profileDefaultPic from "../../../../Images/profile_default.png";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import AddIcon from "@material-ui/icons/Add";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Fab from "@material-ui/core/Fab";
import AddContactModal from "../AddContact/AddContactModal";

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
		position: "relative",
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
		position: "relative",
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
	circleLoading: {
		color: green[500],
		opacity: "70%",
		position: "absolute",
		top: 0,
		left: "50%",
		marginTop: 12,
		// marginLeft: -12,
	},
	fabButton: {
		position: "absolute",
		zIndex: 1,
		bottom: 20,
		left: 0,
		right: 0,
		margin: "0 auto",
	},
}));

const ContactsList = () => {
	const classes = useStyles();
	const token = localStorage.getItem("token");
	const { contactId } = useParams();
	const [contacts, setContacts] = useState([]);
	const [loading, setLoading] = useState();
	const [searchParam, setSearchParam] = useState("");

	const [modalOpen, setModalOpen] = useState(false);

	const history = useHistory();

	useEffect(() => {
		if (!("Notification" in window)) {
			console.log("Esse navegador não suporte notificações");
		} else {
			Notification.requestPermission();
		}
	}, []);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const res = await api.get("/contacts", {
						params: { searchParam },
					});
					setContacts(res.data);
					setLoading(false);
				} catch (err) {
					console.log(err);
				}
			};
			fetchContacts();
		}, 1000);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, token]);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

		socket.emit("joinNotification");

		socket.on("contact", data => {
			if (data.action === "updateUnread") {
				resetUnreadMessages(data.contactId);
			}
		});

		socket.on("appMessage", data => {
			if (data.action === "create") {
				updateUnreadMessagesCount(data);
				if (
					contactId &&
					data.message.contactId === +contactId &&
					document.visibilityState === "visible"
				)
					return;
				showDesktopNotification(data);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [contactId]);

	const updateUnreadMessagesCount = data => {
		setContacts(prevState => {
			const contactIndex = prevState.findIndex(
				contact => contact.id === data.message.contactId
			);

			if (contactIndex !== -1) {
				let aux = [...prevState];
				aux[contactIndex].unreadMessages++;
				aux[contactIndex].lastMessage = data.message.messageBody;
				aux.unshift(aux.splice(contactIndex, 1)[0]);
				return aux;
			} else {
				return [data.contact, ...prevState];
			}
		});
	};

	const showDesktopNotification = data => {
		const options = {
			body: `${data.message.messageBody} - ${moment(new Date())
				.tz("America/Sao_Paulo")
				.format("DD/MM/YY - HH:mm")}`,
			icon: data.contact.profilePicUrl,
		};
		new Notification(`Mensagem de ${data.contact.name}`, options);
		document.getElementById("sound").play();
	};

	const resetUnreadMessages = contactId => {
		setContacts(prevState => {
			let aux = [...prevState];
			let contactIndex = aux.findIndex(contact => contact.id === +contactId);
			aux[contactIndex].unreadMessages = 0;

			return aux;
		});
	};

	const handleSelectContact = (e, contact) => {
		history.push(`/chat/${contact.id}`);
	};

	const handleSearchContact = e => {
		// let searchTerm = e.target.value.toLowerCase();
		setSearchParam(e.target.value.toLowerCase());
	};

	const handleShowContactModal = e => {
		setModalOpen(true);
	};

	const handleAddContact = async contact => {
		try {
			const res = await api.post("/contacts", contact);
			setContacts(prevState => [res.data, ...prevState]);
			setModalOpen(false);
			console.log(res.data);
		} catch (err) {
			if (err.response.status === 422) {
				console.log("deu erro", err.response);
				alert(err.response.data.message);
			} else {
				alert(err);
			}
		}
	};

	return (
		<div className={classes.contactsWrapper}>
			<ContactsHeader />
			<AddContactModal
				setModalOpen={setModalOpen}
				modalOpen={modalOpen}
				handleAddContact={handleAddContact}
			/>
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
					{contacts.map((contact, index) => (
						<React.Fragment key={contact.id}>
							<ListItem
								button
								onClick={e => handleSelectContact(e, contact)}
								selected={contactId && +contactId === contact.id}
							>
								<ListItemAvatar>
									<Avatar
										src={
											contact.profilePicUrl
												? contact.profilePicUrl
												: profileDefaultPic
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
											{contact.lastMessage && (
												<Typography
													className={classes.lastMessageTime}
													component="span"
													variant="body2"
													color="textSecondary"
												>
													{moment(contact.updatedAt)
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
												{contact.lastMessage || <br />}
											</Typography>
											<Badge
												className={classes.newMessagesCount}
												badgeContent={contact.unreadMessages}
												classes={{
													badge: classes.badgeStyle,
												}}
											/>
										</span>
									}
								/>
							</ListItem>
							<Divider variant="inset" component="li" />
						</React.Fragment>
					))}
				</List>
				{loading ? (
					<div>
						<CircularProgress className={classes.circleLoading} />
					</div>
				) : null}
				<Fab
					color="secondary"
					aria-label="add"
					className={classes.fabButton}
					onClick={handleShowContactModal}
				>
					<AddIcon />
				</Fab>
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
