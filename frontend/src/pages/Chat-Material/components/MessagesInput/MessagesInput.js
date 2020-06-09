import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";

import AttachFileIcon from "@material-ui/icons/AttachFile";
import MoodIcon from "@material-ui/icons/Mood";
import SendIcon from "@material-ui/icons/Send";

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
	},

	newMessageBox: {
		background: "#eee",
		display: "flex",
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

	sendMessageIcon: {
		opacity: "80%",
		margin: 4,
		alignSelf: "middle",
		cursor: "pointer",
		"&:hover": {
			opacity: "70%",
		},
	},
}));

const MessagesInput = () => {
	const classes = useStyles();

	return (
		<Paper variant="outlined" className={classes.newMessageBox}>
			<MoodIcon className={classes.sendMessageIcon} />
			<AttachFileIcon className={classes.sendMessageIcon} />
			<div className={classes.messageInputWrapper}>
				<InputBase
					className={classes.messageInput}
					placeholder="Escreva uma mensagem"
				/>
			</div>
			<SendIcon className={classes.sendMessageIcon} />
		</Paper>
	);
};

export default MessagesInput;
