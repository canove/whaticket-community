import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { FiPaperclip, FiSend, FiX, FiSmile, FiDownload } from "react-icons/fi";
import { RiSendPlane2Line } from "react-icons/ri";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import ModalImage from "react-modal-image";

import api from "../../util/api";
import openSocket from "socket.io-client";
import profileDefaultPic from "../../Images/profile_default.png";
import ReactAudioPlayer from "react-audio-player";

import ScrollToBottom from "react-scroll-to-bottom";

import "react-toastify/dist/ReactToastify.css";
import "./ChatBox.css";
// let socket;

const ChatBox = ({ currentPeerContact }) => {
	const SERVER_URL = "http://localhost:8080/";
	const contactId = currentPeerContact.id;
	const unreadMessages = currentPeerContact.messages;
	const userId = localStorage.getItem("userId");
	const username = localStorage.getItem("username");
	const token = localStorage.getItem("token");
	const mediaInitialState = { preview: "", raw: "", name: "" };

	const [listMessages, setListMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");
	const [media, setMedia] = useState(mediaInitialState);
	const [showEmoji, setShowEmoji] = useState(false);

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

		fetchMessages();

		return () => {
			setInputMessage("");
			setShowEmoji(false);
			setMedia({});
		};
	}, [contactId, unreadMessages, token]);

	useEffect(() => {
		const socket = openSocket(SERVER_URL);

		socket.emit("joinChatBox", contactId, () => {});

		socket.on("appMessage", data => {
			if (data.action === "create") {
				addMessage(data.message);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [contactId]);

	const addMessage = message => {
		setListMessages(prevState => [...prevState, message]);
	};

	const handleChangeInput = e => {
		setInputMessage(e.target.value);
	};

	const handleAddEmoji = e => {
		let emoji = e.native;
		setInputMessage(prevState => prevState + emoji);
	};

	const handleChangeMedia = e => {
		if (e.target.files.length) {
			setMedia({
				preview: URL.createObjectURL(e.target.files[0]),
				raw: e.target.files[0],
				name: e.target.files[0].name,
			});
		}
	};

	const handleInputPaste = e => {
		if (e.clipboardData.files[0]) {
			setMedia({
				preview: URL.createObjectURL(e.clipboardData.files[0]),
				raw: e.clipboardData.files[0],
				name: e.clipboardData.files[0].name,
			});
		}
	};

	const handleUploadMedia = async e => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("media", media.raw);
		formData.append("userId", userId);
		formData.append("messageBody", media.name);

		try {
			await api.post(`/messages/${contactId}`, formData, {
				headers: { Authorization: "Bearer " + token },
			});
		} catch (err) {
			console.log(err);
			alert(err);
		}
		setMedia(mediaInitialState);
	};

	const handleSendMessage = async () => {
		if (inputMessage.trim() === "") return;
		const message = {
			read: 1,
			userId: userId,
			mediaUrl: "",
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
		setShowEmoji(false);
	};

	console.log(listMessages);

	const renderMessages = () => {
		if (listMessages.length > 0) {
			let viewListMessages = [];
			listMessages.forEach((message, index) => {
				if (message.userId === 0) {
					if (message.mediaUrl && message.mediaType === "image") {
						viewListMessages.push(
							<div className="viewItemLeft2" key={message.id}>
								<ModalImage
									className="imgItemLeft"
									smallSrcSet={`${SERVER_URL}${message.mediaUrl}`}
									medium={`${SERVER_URL}${message.mediaUrl}`}
									large={`${SERVER_URL}${message.mediaUrl}`}
									alt=""
								/>
								<span className="textContentItem">{message.messageBody}</span>
							</div>
						);
					} else if (message.mediaUrl && message.mediaType === "audio") {
						viewListMessages.push(
							<div className="viewItemLeft3" key={message.id}>
								{message.messageBody}
								<ReactAudioPlayer
									src={`${SERVER_URL}${message.mediaUrl}`}
									controls
								/>
							</div>
						);
					} else if (message.mediaUrl) {
						viewListMessages.push(
							<div className="viewItemLeft" key={message.id}>
								<a
									href={`${SERVER_URL}${message.mediaUrl}`}
									className="textContentItem"
								>
									{message.messageBody}
									<hr></hr>
									Download <FiDownload size="20" />
								</a>
							</div>
						);
					} else {
						viewListMessages.push(
							<div className="viewItemLeft" key={message.id}>
								<span className="textContentItem">{message.messageBody}</span>
							</div>
						);
					}
				} else {
					if (message.mediaUrl && message.mediaType === "image") {
						viewListMessages.push(
							<div className="viewItemRight2" key={message.id}>
								<ModalImage
									className="imgItemLeft"
									smallSrcSet={`${SERVER_URL}${message.mediaUrl}`}
									medium={`${SERVER_URL}${message.mediaUrl}`}
									large={`${SERVER_URL}${message.mediaUrl}`}
									alt=""
								/>
								<span className="textContentItem">{message.messageBody}</span>
							</div>
						);
					} else if (message.mediaUrl && message.mediaType === "audio") {
						viewListMessages.push(
							<div className="viewItemRight3" key={message.id}>
								{message.messageBody}
								<ReactAudioPlayer
									src={`${SERVER_URL}${message.mediaUrl}`}
									controls
								/>
							</div>
						);
					} else if (message.mediaUrl) {
						viewListMessages.push(
							<div className="viewItemRight" key={message.id}>
								<a
									href={`${SERVER_URL}${message.mediaUrl}`}
									className="textContentItem"
								>
									{message.messageBody}
									<hr></hr>
									Download <FiDownload size="20" />
								</a>
							</div>
						);
					} else {
						viewListMessages.push(
							<div className="viewItemRight" key={message.id}>
								<span className="textContentItem ">{message.messageBody}</span>
								<span className="messageAck">{message.ack}</span>
							</div>
						);
					}
				}
			});
			return viewListMessages;
		} else {
			return (
				<div className="viewWrapSayHi">
					<span className="textSayHi">Diga olá para o seu novo contato</span>
				</div>
			);
		}
	};

	return (
		<Card className="viewChatBoard">
			<div className="headerChatBoard">
				<img
					className="viewAvatarItem"
					src={currentPeerContact.imageURL || profileDefaultPic}
					alt=""
				/>
				<span className="textHeaderChatBoard">
					<p style={{ fontSize: "20px" }}>{currentPeerContact.name}</p>
				</span>
				<div className="aboutme">
					<span>
						<p>Status do contato</p>
					</span>
				</div>
			</div>
			<ScrollToBottom className="viewListContentChat">
				<div className="viewListContentChat">{renderMessages()}</div>
			</ScrollToBottom>
			{media.preview ? (
				<div className="viewMediaBottom">
					<FiX
						color="gray"
						className="icOpenGallery"
						onClick={e => setMedia(mediaInitialState)}
					/>
					<span className="viewMediaInput">
						{media.name}
						{/* <img src={media.preview} alt=""></img> */}
					</span>
					<RiSendPlane2Line
						color="gray"
						className="icSend"
						onClick={handleUploadMedia}
					/>
				</div>
			) : (
				<div className="viewBottom">
					<div>
						{showEmoji ? (
							<div className="viewStickers">
								<Picker onSelect={handleAddEmoji} />
							</div>
						) : null}

						<FiSmile
							color="gray"
							className="icOpenEmojis"
							onClick={e => setShowEmoji(prevState => !prevState)}
						/>
						<label htmlFor="upload-button">
							<FiPaperclip color="gray" className="icOpenGallery" />
						</label>
						<input
							type="file"
							id="upload-button"
							style={{ display: "none" }}
							onChange={handleChangeMedia}
						/>
					</div>

					<input
						// ref={input => inputMessage && inputMessage.focus()}
						name="inputMessage"
						autoComplete="off"
						className="viewInput"
						placeholder="Digite uma mensagem"
						onPaste={handleInputPaste}
						value={inputMessage}
						onChange={handleChangeInput}
						onKeyPress={e => {
							if (e.key === "Enter") {
								handleSendMessage();
							}
						}}
					/>

					<FiSend color="gray" className="icSend" onClick={handleSendMessage} />
				</div>
			)}
		</Card>
	);
};

export default ChatBox;
