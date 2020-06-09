import React, { useState, useEffect, useRef } from "react";
import InfiniteScrollReverse from "react-infinite-scroll-reverse";
import { Spinner } from "react-bootstrap";
import {
	FiPaperclip,
	FiSend,
	FiTrash2,
	FiSmile,
	FiFastForward,
	FiFile,
} from "react-icons/fi";
import { BsCheck, BsCheckAll, BsClock } from "react-icons/bs";

import { Picker } from "emoji-mart";
import ModalImage from "react-modal-image";
import moment from "moment-timezone";

import api from "../../util/api";
import openSocket from "socket.io-client";
import profileDefaultPic from "../../Images/profile_default.png";
import ReactAudioPlayer from "react-audio-player";

import "react-toastify/dist/ReactToastify.css";
import "emoji-mart/css/emoji-mart.css";
import "./ChatBox.css";

const ChatBox = ({ currentPeerContact }) => {
	const SERVER_URL = "http://localhost:8080/";
	const contactId = currentPeerContact.id;

	const userId = localStorage.getItem("userId");
	const username = localStorage.getItem("username");
	const token = localStorage.getItem("token");

	const mediaInitialState = { preview: "", raw: "", name: "" };
	const [inputMessage, setInputMessage] = useState("");
	const [media, setMedia] = useState(mediaInitialState);
	const [showEmoji, setShowEmoji] = useState(false);
	const [loading, setLoading] = useState(true);
	const [listMessages, setListMessages] = useState([]);
	const [hasMore, setHasMore] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [pageNumber, setPageNumber] = useState(0);
	const lastMessageRef = useRef();

	useEffect(() => {
		setListMessages([]);
	}, [searchParam]);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			console.log(searchParam);
			const fetchMessages = async () => {
				try {
					const res = await api.get("/messages/" + contactId, {
						headers: { Authorization: "Bearer " + token },
						params: { searchParam, pageNumber },
					});
					setListMessages(prevMessages => {
						return [...res.data.messages, ...prevMessages];
					});
					setHasMore(res.data.messages.length > 0);
					setLoading(false);
					console.log(res.data);
					if (pageNumber === 1 && res.data.messages.length > 0) {
						scrollToBottom();
					}
				} catch (err) {
					console.log(err);
					alert(err);
				}
			};
			fetchMessages();
		}, 1000);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, pageNumber, contactId, token]);

	useEffect(() => {
		const socket = openSocket(SERVER_URL);

		socket.emit("joinChatBox", contactId, () => {});

		socket.on("appMessage", data => {
			if (data.action === "create") {
				addMessage(data.message);
				scrollToBottom();
			} else if (data.action === "update") {
				updateMessageAck(data.message);
			}
		});

		return () => {
			socket.disconnect();
			setInputMessage("");
			setSearchParam("");
			setShowEmoji(false);
			setPageNumber(1);
			setMedia({});
			setListMessages([]);
		};
	}, [contactId]);

	const loadMore = () => {
		setPageNumber(prevPageNumber => prevPageNumber + 1);
	};

	const updateMessageAck = message => {
		let id = message.id;
		setListMessages(prevState => {
			let aux = [...prevState];
			let messageIndex = aux.findIndex(message => message.id === id);
			aux[messageIndex].ack = message.ack;

			return aux;
		});
	};

	const scrollToBottom = () => {
		if (lastMessageRef) {
			lastMessageRef.current.scrollIntoView({});
		}
	};

	const addMessage = message => {
		setListMessages(prevState => {
			if (prevState.length >= 20) {
				let aux = [...prevState];
				aux.shift();
				aux.push(message);
				return aux;
			} else {
				return [...prevState, message];
			}
		});
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

	const handleSearch = e => {
		setSearchParam(e.target.value);
		setPageNumber(1);
	};

	const checkMessageDay = (message, index) => {
		if (index < listMessages.length - 1) {
			let messageDay = moment(listMessages[index].createdAt)
				.tz("America/Sao_Paulo")
				.format("DD");

			let nextMessageDay = moment(listMessages[index + 1].createdAt)
				.tz("America/Sao_Paulo")
				.format("DD");

			if (messageDay < nextMessageDay) {
				return (
					<span className="textTime" key={message.createdAt}>
						<div className="time">
							{moment(listMessages[index + 1].createdAt)
								.tz("America/Sao_Paulo")
								.format("DD/MM/YY")}
						</div>
					</span>
				);
			}
		}
		if (index + 1 === listMessages.length) {
			return (
				<div
					key={`ref-${message.createdAt}`}
					ref={lastMessageRef}
					style={{ float: "left", clear: "both" }}
				></div>
			);
		}
	};

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
									smallSrcSet={message.mediaUrl}
									medium={message.mediaUrl}
									large={message.mediaUrl}
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
							</div>,
							checkMessageDay(message, index)
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
							</div>,
							checkMessageDay(message, index)
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
							</div>,
							checkMessageDay(message, index)
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
										<FiFile size="20" />
									</a>
									<span className="timestamp">
										{moment(message.createdAt)
											.tz("America/Sao_Paulo")
											.format("HH:mm")}
									</span>
								</div>
							</div>,
							checkMessageDay(message, index)
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
							</div>,
							checkMessageDay(message, index)
						);
					}
				} // mensagens enviadas
				else {
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
							</div>,
							checkMessageDay(message, index)
						);
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
							</div>,
							checkMessageDay(message, index)
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
							</div>,
							checkMessageDay(message, index)
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
										<FiFile size="20" />
									</a>
									<span className="timestamp">
										{moment(message.createdAt)
											.tz("America/Sao_Paulo")
											.format("HH:mm")}{" "}
										{renderMsgAck(message)}
									</span>
								</div>
							</div>,
							checkMessageDay(message, index)
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
							</div>,
							checkMessageDay(message, index)
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

	console.log(listMessages);

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
					<span>
						<p>Status do contato</p>
					</span>
				</div>
				<div className="search-input-container">
					<input
						className="search-input-field"
						type="text"
						placeholder="Buscar Mensagens"
						onChange={handleSearch}
						value={searchParam}
					/>
				</div>
			</div>
			<InfiniteScrollReverse
				className="viewListContentChat"
				hasMore={hasMore}
				isLoading={loading}
				loadMore={loadMore}
				loadArea={10}
			>
				{listMessages.length > 0 ? renderMessages() : []}
			</InfiniteScrollReverse>

			{media.preview ? (
				<div className="viewMediaBottom">
					<FiTrash2
						color="gray"
						className="icOpenGallery"
						onClick={e => setMedia(mediaInitialState)}
					/>
					<span className="viewMediaInput">
						{media.name}
						{/* <img src={media.preview} alt=""></img> */}
					</span>
					<FiFastForward
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
			{loading ? (
				<div className="viewLoading">
					<Spinner animation="border" variant="success" />
				</div>
			) : null}
		</div>
	);
};

export default ChatBox;
