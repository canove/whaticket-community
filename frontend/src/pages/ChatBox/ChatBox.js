import React, { useState, useEffect, useRef } from "react";
// import { Card } from "react-bootstrap"; alterei pra DIV, remover caso não dê problemas
import { FiPaperclip, FiSend, FiX, FiSmile } from "react-icons/fi";
import { RiSendPlane2Line } from "react-icons/ri";
import { BsCheck, BsCheckAll, BsClock } from "react-icons/bs";
import { FaFileDownload } from "react-icons/fa";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import ModalImage from "react-modal-image";
import moment from "moment-timezone";

import api from "../../util/api";
import openSocket from "socket.io-client";
import profileDefaultPic from "../../Images/profile_default.png";
import ReactAudioPlayer from "react-audio-player";

import ScrollToBottom from "react-scroll-to-bottom";

import "react-toastify/dist/ReactToastify.css";
import "./ChatBox.css";

// const executeScroll = myRef =>
// 	myRef.current.scrollIntoView({
// 		// behavior: "smooth",
// 		block: "end",
// 	});

const ChatBox = ({ currentPeerContact }) => {
	const SERVER_URL = "http://localhost:8080/";
	const contactId = currentPeerContact.id;
	const unreadMessages = currentPeerContact.messages;
	const userId = localStorage.getItem("userId");
	const username = localStorage.getItem("username");
	const token = localStorage.getItem("token");
	const mediaInitialState = { preview: "", raw: "", name: "" };
	// const [isLoading, setIsLoading] = useState(true);

	const [listMessages, setListMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");
	const [media, setMedia] = useState(mediaInitialState);
	const [showEmoji, setShowEmoji] = useState(false);

	// let lastMessageRef = useRef();

	// useEffect(() => {
	// 	executeScroll(lastMessageRef);
	// }, [isLoading]);

	useEffect(() => {
		const fetchMessages = async () => {
			// setIsLoading(true);
			try {
				const res = await api.get("/messages/" + contactId, {
					headers: { Authorization: "Bearer " + token },
					params: { page: 3 },
				});
				setListMessages(res.data);
				// setIsLoading(false);
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
			// setIsLoading(true);
			if (data.action === "create") {
				addMessage(data.message);
			} else if (data.action === "update") {
				updateMessageAck(data.message);
			}
			// setIsLoading(false);
		});

		return () => {
			socket.disconnect();
		};
	}, [contactId]);

	const updateMessageAck = message => {
		let id = message.id;
		setListMessages(prevState => {
			console.log("mudando o ack da mensagem");
			let aux = [...prevState];
			let messageIndex = aux.findIndex(message => message.id === id);
			aux[messageIndex].ack = message.ack;

			return aux;
		});
	};

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

	const renderMsgAck = message => {
		//todo remove timestamp logic from main return and adopt moment to timestamps
		if (message.ack === 0) {
			return <BsClock size="18" />;
		} else if (message.ack === 1) {
			return <BsCheck size="18" />;
		} else if (message.ack === 2) {
			return <BsCheckAll size="18" />;
		} else if (message.ack === 3) {
			return <BsCheckAll size="18" color="green" />;
		}
	};

	const renderMessages = () => {
		if (listMessages.length > 0) {
			let viewListMessages = [];
			listMessages.forEach((message, index) => {
				// mensagens recebidas
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
								<div className="textContentItem">
									{message.messageBody}
									<span className="timestamp">
										{moment(message.createdAt)
											.tz("America/Sao_Paulo")
											.format("HH:mm")}
									</span>
								</div>
							</div>
						);
					} else if (message.mediaUrl && message.mediaType === "audio") {
						viewListMessages.push(
							<div className="viewItemLeft2" key={message.id}>
								<ReactAudioPlayer
									src={`${SERVER_URL}${message.mediaUrl}`}
									controls
								/>
								<div className="textContentItem">
									<span className="timestamp">
										{moment(message.createdAt)
											.tz("America/Sao_Paulo")
											.format("HH:mm")}
									</span>
								</div>
							</div>
						);
					} else if (message.mediaUrl && message.mediaType === "video") {
						viewListMessages.push(
							<div className="viewItemLeft2" key={message.id}>
								<video
									className="imgItemLeft"
									src={`${SERVER_URL}${message.mediaUrl}`}
									controls
								/>
								<div className="textContentItem">
									{message.messageBody}
									<span className="timestamp">
										{moment(message.createdAt)
											.tz("America/Sao_Paulo")
											.format("HH:mm")}
									</span>
								</div>
							</div>
						);
					} else if (message.mediaUrl) {
						viewListMessages.push(
							<div className="viewItemLeft" key={message.id}>
								<div className="textContentItem">
									<a
										href={`${SERVER_URL}${message.mediaUrl}`}
										className="textContentItem"
									>
										{message.messageBody}
										<FaFileDownload size="20" />
									</a>
									<span className="timestamp">
										{moment(message.createdAt)
											.tz("America/Sao_Paulo")
											.format("HH:mm")}
									</span>
								</div>
							</div>
						);
					} else {
						viewListMessages.push(
							<div className="viewItemLeft" key={message.id}>
								<div className="textContentItem">
									{message.messageBody}
									<span className="timestamp">
										{moment(message.createdAt)
											.tz("America/Sao_Paulo")
											.format("HH:mm")}
									</span>
								</div>
							</div>
						);
					}
				} else {
					if (message.mediaUrl && message.mediaType === "image") {
						viewListMessages.push(
							<div className="viewItemRight2" key={message.id}>
								<ModalImage
									className="imgItemRight"
									smallSrcSet={`${SERVER_URL}${message.mediaUrl}`}
									medium={`${SERVER_URL}${message.mediaUrl}`}
									large={`${SERVER_URL}${message.mediaUrl}`}
									alt=""
								/>
								<div className="textContentItem">
									{message.messageBody}
									<span className="timestamp">
										{moment(message.createdAt)
											.tz("America/Sao_Paulo")
											.format("HH:mm")}{" "}
										{renderMsgAck(message)}
									</span>
								</div>
							</div>
						);
						// mensagens enviadas
					} else if (message.mediaUrl && message.mediaType === "audio") {
						viewListMessages.push(
							<div className="viewItemRight2 " key={message.id}>
								<ReactAudioPlayer
									src={`${SERVER_URL}${message.mediaUrl}`}
									controls
								/>
								<div className="textContetItem">
									<span className="timestamp">
										{moment(message.createdAt)
											.tz("America/Sao_Paulo")
											.format("HH:mm")}{" "}
										{renderMsgAck(message)}
									</span>
								</div>
							</div>
						);
					} else if (message.mediaUrl && message.mediaType === "video") {
						viewListMessages.push(
							<div className="viewItemRight2" key={message.id}>
								<video src={`${SERVER_URL}${message.mediaUrl}`} controls />
								{message.messageBody}
								<span className="timestamp">
									{moment(message.createdAt)
										.tz("America/Sao_Paulo")
										.format("HH:mm")}{" "}
									{renderMsgAck(message)}
								</span>
							</div>
						);
					} else if (message.mediaUrl) {
						viewListMessages.push(
							<div className="viewItemRight" key={message.id}>
								<div className="textContentItem">
									<a
										href={`${SERVER_URL}${message.mediaUrl}`}
										className="textContentItem"
									>
										{message.messageBody}
										<FaFileDownload size="20" />
									</a>
									<span className="timestamp">
										{moment(message.createdAt)
											.tz("America/Sao_Paulo")
											.format("HH:mm")}{" "}
										{renderMsgAck(message)}
									</span>
								</div>
							</div>
						);
					} else {
						viewListMessages.push(
							<div className="viewItemRight" key={message.id}>
								<div className="textContentItem">
									{message.messageBody}
									<span className="timestamp">
										{moment(message.createdAt)
											.tz("America/Sao_Paulo")
											.format("HH:mm")}{" "}
										{renderMsgAck(message)}
									</span>
								</div>
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
		<div className="viewChatBoard">
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
					<span>Status do contato</span>
				</div>
			</div>
			<ScrollToBottom className="viewListContentChat">
				<div className="viewListContentChat">
					{renderMessages()}
					{/* <div ref={lastMessageRef}> </div> */}
				</div>
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
		</div>
	);
};

export default ChatBox;
