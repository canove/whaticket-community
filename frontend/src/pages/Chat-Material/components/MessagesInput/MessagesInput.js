import React, { useState, useEffect } from "react";
import api from "../../../../util/api";
import { Picker } from "emoji-mart";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";

import AttachFileIcon from "@material-ui/icons/AttachFile";
import MoodIcon from "@material-ui/icons/Mood";
import SendIcon from "@material-ui/icons/Send";
import CancelIcon from "@material-ui/icons/Cancel";

const useStyles = makeStyles(theme => ({
	newMessageBox: {
		background: "#eee",
		display: "flex",
		position: "relative",
		padding: "10px 13px",
		borderTopLeftRadius: 0,
		borderTopRightRadius: 0,
		borderBottomLeftRadius: 0,
	},

	messageInputWrapper: {
		background: "#fff",
		borderRadius: 40,
		flex: 1,
	},

	messageInput: {
		paddingLeft: 10,
		border: "none",
		borderRadius: 30,
		width: "80%",
	},

	sendMessageIcons: {
		color: "grey",
		margin: 4,
		cursor: "pointer",
		"&:hover": {
			opacity: "70%",
		},
	},

	viewMediaInputWrapper: {
		display: "flex",
		padding: "10px 13px",
		position: "relative",
		borderTopLeftRadius: 0,
		borderTopRightRadius: 0,
		borderBottomLeftRadius: 0,
		justifyContent: "space-between",
		backgroundColor: "#eee",
	},

	emojiBox: {
		position: "absolute",
		bottom: 50,
		borderTop: "1px solid #e8e8e8",
	},

	circleLoading: {
		color: green[500],
		position: "absolute",
		top: 0,
		left: "50%",
		marginTop: 6,
		marginBottom: 6,
		marginLeft: -12,
	},
}));

const MessagesInput = ({ selectedContact }) => {
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
			<Paper variant="outlined" className={classes.viewMediaInputWrapper}>
				<CancelIcon
					className={classes.sendMessageIcons}
					onClick={e => setMedia(mediaInitialState)}
				/>
				<span>
					{media.name}
					{/* <img src={media.preview} alt=""></img> */}
				</span>
				{loading ? (
					<div>
						<CircularProgress className={classes.circleLoading} />
					</div>
				) : null}
				<SendIcon
					className={classes.sendMessageIcons}
					onClick={handleUploadMedia}
				/>
			</Paper>
		);
	else {
		return (
			<Paper variant="outlined" className={classes.newMessageBox}>
				<MoodIcon
					className={classes.sendMessageIcons}
					onClick={e => setShowEmoji(prevState => !prevState)}
				/>
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
				<label htmlFor="upload-button" className={classes.sendMessageIcons}>
					<AttachFileIcon />
				</label>
				<input
					type="file"
					id="upload-button"
					style={{ display: "none" }}
					onChange={handleChangeMedia}
				/>
				<div className={classes.messageInputWrapper}>
					<InputBase
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
				<SendIcon
					className={classes.sendMessageIcons}
					onClick={handleSendMessage}
				/>
			</Paper>
		);
	}
};

export default MessagesInput;
