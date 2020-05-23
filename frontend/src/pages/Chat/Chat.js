import React, { useState, useEffect } from "react";
import "./Chat.css";
import api from "../../util/api";
import profilePic from "../../Images/canove.png";
import profileDefaultPic from "../../Images/profile_default.png";
import openSocket from "socket.io-client";
import { FiSearch } from "react-icons/fi";

import LogedinNavbar from "../../components/Navbar/LogedinNavbar";
import DefaultNavbar from "../../components/Navbar/DefaultNavbar";

import ChatBox from "../ChatBox/ChatBox";

const Chat = ({ showToast }) => {
	const token = localStorage.getItem("token");
	const username = localStorage.getItem("username");

	const [currentPeerContact, setCurrentPeerContact] = useState(null);
	const [contacts, setContacts] = useState([]);
	const [displayedContacts, setDisplayedContacts] = useState([]);

	useEffect(() => {
		const fetchContacts = async () => {
			const res = await api.get("/contacts", {
				headers: { Authorization: "Bearer " + token },
			});
			setContacts(res.data);
			setDisplayedContacts(res.data);
		};
		fetchContacts();
		const socket = openSocket("http://localhost:8080");

		socket.on("contact", data => {
			console.log(data);
			if (data.action === "create") {
				addContact(data.contact);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [currentPeerContact, token]);

	const addContact = contact => {
		setContacts(prevState => [...prevState, contact]);
		console.log("adicionando contato", contact);
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
												src={profileDefaultPic}
											/>
											<div className="viewWrapContentItem">
												<span className="textItem">{contact.name}</span>
											</div>

											{contact.messages && contact.messages.length > 0 && (
												<div className="notificationpragraph">
													<p className="newmessages">
														{contact.messages.length}
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
