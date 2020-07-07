import React, { useState, useEffect } from "react";
import "emoji-mart/css/emoji-mart.css";
import { useParams } from "react-router-dom";
import { Picker } from "emoji-mart";
import MicRecorder from "mic-recorder-to-mp3";

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
import MicIcon from "@material-ui/icons/Mic";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";

import api from "../../../../util/api";
import RecordingTimer from "./RecordingTimer";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

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
		opacity: "70%",
		position: "absolute",
		top: "20%",
		left: "50%",
		// marginTop: 8,
		// marginBottom: 6,
		marginLeft: -12,
	},

	recorderWrapper: {
		display: "flex",
		alignItems: "center",
		alignContent: "middle",
	},

	cancelAudioIcon: {
		color: "red",
	},

	sendAudioIcon: {
		color: "green",
	},
}));

const MessagesInput = ({ searchParam }) => {
	const classes = useStyles();
	const { contactId } = useParams();
	const userId = localStorage.getItem("userId");
	const username = localStorage.getItem("username");

	const mediaInitialState = { preview: "", raw: "", name: "" };
	const [media, setMedia] = useState(mediaInitialState);
	const [inputMessage, setInputMessage] = useState("");
	const [showEmoji, setShowEmoji] = useState(false);
	const [loading, setLoading] = useState(false);

	const [recording, setRecording] = useState(false);
	const [blobURL, setBlobURL] = useState("");

	useEffect(() => {
		return () => {
			setInputMessage("");
			setShowEmoji(false);
			setMedia({});
		};
	}, [contactId]);

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
			await api.post(`/messages/${contactId}`, formData);
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
			await api.post(`/messages/${contactId}`, message);
		} catch (err) {
			alert(err);
		}
		setInputMessage("");
		setShowEmoji(false);
	};

	const startRecording = () => {
		navigator.getUserMedia(
			{ audio: true },
			() => {
				Mp3Recorder.start()
					.then(() => {
						setRecording(true);
					})
					.catch(e => console.error(e));
			},
			() => {
				console.log("Permission Denied");
			}
		);
	};

	const stopRecording = () => {
		Mp3Recorder.stop()
			.getMp3()
			.then(([buffer, blob]) => {
				const blobURL = URL.createObjectURL(blob);
				setBlobURL(blobURL);
				setRecording(false);
			})
			.catch(e => console.log(e));
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
				<audio src={blobURL} controls="controls" />
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
						disabled={recording}
						onPaste={handleInputPaste}
						onKeyPress={e => {
							if (e.key === "Enter") {
								handleSendMessage();
							}
						}}
					/>
				</div>
				{inputMessage ? (
					<IconButton
						aria-label="sendMessage"
						component="span"
						onClick={handleSendMessage}
					>
						<SendIcon className={classes.sendMessageIcons} />
					</IconButton>
				) : recording ? (
					<div className={classes.recorderWrapper}>
						<IconButton
							aria-label="cancelRecording"
							component="span"
							fontSize="large"
							onClick={e => setRecording(false)}
						>
							<HighlightOffIcon className={classes.cancelAudioIcon} />
						</IconButton>
						<RecordingTimer />
						<IconButton
							aria-label="sendRecordedAudio"
							component="span"
							onClick={stopRecording}
						>
							<CheckCircleOutlineIcon className={classes.sendAudioIcon} />
						</IconButton>
					</div>
				) : (
					<IconButton
						aria-label="showRecorder"
						component="span"
						onClick={startRecording}
					>
						<MicIcon className={classes.sendMessageIcons} />
					</IconButton>
				)}
			</Paper>
		);
	}
};

export default MessagesInput;
