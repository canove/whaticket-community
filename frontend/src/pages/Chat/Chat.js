import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import api from "../../util/api";
import profilePic from "../../Images/canove.png";
import profileDefaultPic from "../../Images/profile_default.png";
import openSocket from "socket.io-client";
import { FiSearch } from "react-icons/fi";

import LogedinNavbar from "../../components/Navbar/LogedinNavbar";
import DefaultNavbar from "../../components/Navbar/DefaultNavbar";

import ChatBox from "../ChatBox/ChatBox";
import "./Chat.css";
// let socket;

const Chat = ({ showToast }) => {
	const token = localStorage.getItem("token");
	const username = localStorage.getItem("username");

	const history = useHistory();

	const [currentPeerContact, setCurrentPeerContact] = useState(null);
	const [contacts, setContacts] = useState([]);
	const [displayedContacts, setDisplayedContacts] = useState([]);
	const [notification, setNotification] = useState(true);

	useEffect(() => {
		const fetchContacts = async () => {
			try {
				const res = await api.get("/contacts", {
					headers: { Authorization: "Bearer " + token },
				});
				setContacts(res.data);
				setDisplayedContacts(res.data);
			} catch (err) {
				if (err.response.data.message === "invalidToken") {
					localStorage.removeItem("token");
					localStorage.removeItem("username");
					localStorage.removeItem("userId");
					history.push("/login");
					alert("Sessão expirada, por favor, faça login novamente.");
				}
				console.log(err);
			}
		};
		fetchContacts();
	}, [currentPeerContact, token, notification, history]);

	useEffect(() => {
		const socket = openSocket("http://localhost:8080");

		socket.emit("joinNotification");

		socket.on("contact", data => {
			if (data.action === "create") {
				addContact(data.contact);
				setNotification(prevState => !prevState);
			}
		});

		socket.on("appMessage", data => {
			setNotification(prevState => !prevState);
			// handleUnreadMessages(data.message.contactId);
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	// const handleUnreadMessages = contactId => {
	// 	console.log("Atualizando mensagens n lidas");
	// 	console.log(contacts);
	// 	let aux = [...contacts];
	// 	let contactIndex = aux.findIndex(contact => contact.id === contactId);
	// 	aux[contactIndex].unreadMessages++;

	// 	aux.unshift(aux.splice(contactIndex, 1)[0]);

	// 	setDisplayedContacts(aux);
	// };

	const addContact = contact => {
		setContacts(prevState => [...prevState, contact]);
		setDisplayedContacts(prevState => [...prevState, contact]);
	};

	const handleSearchContact = e => {
		let searchTerm = e.target.value.toLowerCase();

		setDisplayedContacts(
			contacts.filter(contact =>
				contact.name.toLowerCase().includes(searchTerm)
			)
		);
	};

	const handleSelectContact = (e, contact) => {
		setCurrentPeerContact(contact);
	};

	return (
		<div>
			{!localStorage.getItem("token") ? (
				<div>
					<DefaultNavbar />
					<h1> Você não está logado </h1>
				</div>
			) : (
				<div>
					<LogedinNavbar />
					<div className="root">
						<div className="body">
							<div className="viewListUser">
								<div className="profileviewleftside">
									<img className="ProfilePicture" alt="" src={profilePic} />
									<span className="ProfileHeaderText">{username}</span>
								</div>
								<div className="rootsearchbar">
									<div className="input-container">
										<i className="fa fa-search icon">
											<FiSearch size="20px" />
										</i>
										<input
											className="input-field"
											type="text"
											placeholder="Buscar Contato"
											onChange={handleSearchContact}
										/>
									</div>
								</div>
								{displayedContacts &&
									displayedContacts.length > 0 &&
									displayedContacts.map((contact, index) => (
										<button
											className={
												currentPeerContact &&
												currentPeerContact.id === contact.id
													? "selectedviewWrapItem"
													: "viewWrapItem"
											}
											id={contact.id}
											key={contact.id}
											onClick={e => handleSelectContact(e, contact)}
										>
											<img
												className="viewAvatarItem"
												alt=""
												src={
													contact.imageURL
														? contact.imageURL
														: profileDefaultPic
												}
											/>
											<div className="viewWrapContentItem">
												<span className="textItem">{contact.name}</span>
											</div>

											{contact.unreadMessages > 0 && (
												<div className="notificationpragraph">
													<p className="newmessages">
														{contact.unreadMessages}
													</p>
												</div>
											)}
										</button>
									))}
							</div>
							<div className="viewBoard">
								{currentPeerContact ? (
									<ChatBox currentPeerContact={currentPeerContact} />
								) : null}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Chat;
