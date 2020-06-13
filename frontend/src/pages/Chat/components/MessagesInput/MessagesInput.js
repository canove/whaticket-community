import React, { useState, useEffect } from "react";
import api from "../../../../util/api";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";

import AttachFileIcon from "@material-ui/icons/AttachFile";
import IconButton from "@material-ui/core/IconButton";
import MoodIcon from "@material-ui/icons/Mood";
import SendIcon from "@material-ui/icons/Send";
import CancelIcon from "@material-ui/icons/Cancel";

const useStyles = makeStyles(theme => ({
	newMessageBox: {
		background: "#eee",
		display: "flex",
		padding: "10px",
		alignItems: "center",
	},

	messageInputWrapper: {
		padding: 6,
		background: "#fff",
		display: "flex",
		borderRadius: 40,
		flex: 1,
	},

	messageInput: {
		paddingLeft: 10,
		flex: 1,
		border: "none",
	},

	sendMessageIcons: {
		color: "grey",
	},

	uploadInput: {
		display: "none",
	},

	viewMediaInputWrapper: {
		display: "flex",
		padding: "10px 13px",
		position: "relative",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#eee",
	},

	emojiBox: {
		position: "absolute",
		bottom: 63,
		width: 40,
		borderTop: "1px solid #e8e8e8",
	},

	circleLoading: {
		color: green[500],
		position: "absolute",
		top: "20%",
		left: "50%",
		// marginTop: 8,
		// marginBottom: 6,
		marginLeft: -12,
	},
}));

const MessagesInput = ({ selectedContact, searchParam }) => {
	const classes = useStyles();
	const contactId = selectedContact.id;
	const userId = localStorage.getItem("userId");
	const username = localStorage.getItem("username");
	const token = localStorage.getItem("token");

	const mediaInitialState = { preview: "", raw: "", name: "" };
	const [media, setMedia] = useState(mediaInitialState);
	const [inputMessage, setInputMessage] = useState("");
	const [showEmoji, setShowEmoji] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		return () => {
			setInputMessage("");
			setShowEmoji(false);
			setMedia({});
		};
	}, [selectedContact]);

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
		setLoading(true);
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
		setLoading(false);
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

	if (media.preview)
		return (
			<Paper
				variant="outlined"
				square
				className={classes.viewMediaInputWrapper}
			>
				<IconButton
					aria-label="cancel-upload"
					component="span"
					onClick={e => setMedia(mediaInitialState)}
				>
					<CancelIcon className={classes.sendMessageIcons} />
				</IconButton>

				{loading ? (
					<div>
						<CircularProgress className={classes.circleLoading} />
					</div>
				) : (
					<span>
						{media.name}
						{/* <img src={media.preview} alt=""></img> */}
					</span>
				)}
				<IconButton
					aria-label="send-upload"
					component="span"
					onClick={handleUploadMedia}
				>
					<SendIcon className={classes.sendMessageIcons} />
				</IconButton>
			</Paper>
		);
	else {
		return (
			<Paper variant="outlined" square className={classes.newMessageBox}>
				<IconButton
					aria-label="emojiPicker"
					component="span"
					onClick={e => setShowEmoji(prevState => !prevState)}
				>
					<MoodIcon className={classes.sendMessageIcons} />
				</IconButton>
				{showEmoji ? (
					<div className={classes.emojiBox}>
						<Picker
							perLine={16}
							showPreview={false}
							showSkinTones={false}
							onSelect={handleAddEmoji}
						/>
					</div>
				) : null}

				<input
					type="file"
					id="upload-button"
					className={classes.uploadInput}
					onChange={handleChangeMedia}
				/>
				<label htmlFor="upload-button">
					<IconButton aria-label="upload" component="span">
						<AttachFileIcon className={classes.sendMessageIcons} />
					</IconButton>
				</label>
				<div className={classes.messageInputWrapper}>
					<InputBase
						inputRef={input => input && !searchParam && input.focus()}
						className={classes.messageInput}
						placeholder="Escreva uma mensagem"
						value={inputMessage}
						onChange={handleChangeInput}
						onPaste={handleInputPaste}
						onKeyPress={e => {
							if (e.key === "Enter") {
								handleSendMessage();
							}
						}}
					/>
				</div>
				<IconButton
					aria-label="emojiPicker"
					component="span"
					onClick={handleSendMessage}
				>
					<SendIcon className={classes.sendMessageIcons} />
				</IconButton>
			</Paper>
		);
	}
};

export default MessagesInput;
