import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import profileDefaultPic from "../../Images/profile_default.png";
import uploadPic from "../../Images/upload.png";
import sendPic from "../../Images/send.png";
import api from "../../util/api";
import openSocket from "socket.io-client";

import ScrollToBottom from "react-scroll-to-bottom";

import "react-toastify/dist/ReactToastify.css";
import "./ChatBox.css";

const ChatBox = ({ currentPeerContact }) => {
	const contactId = currentPeerContact.id;
	const unreadMessages = currentPeerContact.messages;
	const userId = localStorage.getItem("userId");
	const username = localStorage.getItem("username");
	const token = localStorage.getItem("token");

	const [listMessages, setListMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const res = await api.get("/messages/" + contactId, {
					headers: { Authorization: "Bearer " + token },
				});
				setListMessages(res.data);
			} catch (err) {
				alert(err);
			}
		};

		const readMesages = async () => {
			try {
				await api.post(
					"/messages/setread",
					{ messagesToSetRead: unreadMessages },
					{ headers: { Authorization: "Bearer " + token } }
				);
			} catch (err) {
				alert(err);
			}
		};

		const socket = openSocket("http://localhost:8080");
		socket.on("appMessage", data => {
			if (data.action === "create") {
				if (contactId === data.message.contactId) {
					addMessage(data.message);
				}
			}
		});

		fetchMessages();
		readMesages();

		return () => {
			socket.disconnect();
		};
	}, [contactId, unreadMessages, token]);

	const handleChangeInput = e => {
		setInputMessage(e.target.value);
	};

	const handleSendMessage = async () => {
		if (inputMessage.trim() === "") return;
		const message = {
			read: 1,
			userId: userId,
			messageBody: `${username}: ${inputMessage.trim()}`,
		};
		try {
			await api.post(`/messages/${contactId}`, message, {
				headers: { Authorization: "Bearer " + token },
			});
		} catch (err) {
			alert(err);
		}
		setInputMessage("");
	};

	const addMessage = message => {
		setListMessages(prevState => [...prevState, message]);
	};

	return (
		<Card className="viewChatBoard">
			<div className="headerChatBoard">
				<img className="viewAvatarItem" src={profileDefaultPic} alt="" />
				<span className="textHeaderChatBoard">
					<p style={{ fontSize: "20px" }}>{currentPeerContact.name}</p>
				</span>
			</div>
			<ScrollToBottom className="viewListContentChat">
				<div className="viewListContentChat">
					{listMessages.map((message, index) =>
						message.userId === 0 ? (
							<div className="viewItemLeft" key={message.id}>
								<span className="textContentItem">{message.messageBody}</span>
							</div>
						) : (
							<div className="viewItemRight" key={message.id}>
								<span className="textContentItem">{message.messageBody}</span>
							</div>
						)
					)}
				</div>
			</ScrollToBottom>
			<div className="viewBottom">
				<img className="icOpenGallery" src={uploadPic} alt="" />
				<input
					// ref={input => input && input.focus()}
					name="inputMessage"
					className="viewInput"
					placeholder="mensagem"
					value={inputMessage}
					onChange={handleChangeInput}
					onKeyPress={e => {
						if (e.key === "Enter") {
							handleSendMessage();
						}
					}}
				></input>
				<img
					className="icSend"
					src={sendPic}
					alt=""
					onClick={handleSendMessage}
				/>
			</div>
		</Card>
	);
};

export default ChatBox;
