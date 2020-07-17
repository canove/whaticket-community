import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import TicketsList from "./components/TicketsList/TicketsList";
import MessagesList from "./components/MessagesList/MessagesList";

const useStyles = makeStyles(theme => ({
	chatContainer: {
		flex: 1,
		// backgroundColor: "#eee",
		padding: theme.spacing(4),
		height: `calc(100% - 64px)`,
		overflowY: "hidden",
	},

	chatPapper: {
		backgroundColor: "#eee",
		display: "flex",
		height: "100%",
		overflowY: "hidden",
	},

	contactsWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflow: "hidden",
	},
	messagessWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflow: "hidden",
	},
	welcomeMsg: {
		backgroundColor: "#eee",
		display: "flex",
		justifyContent: "space-evenly",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
	},
}));

const Chat = () => {
	const classes = useStyles();
	const { ticketId } = useParams();

	return (
		<div className={classes.chatContainer}>
			<Paper square className={classes.chatPapper}>
				<Grid container spacing={0}>
					<Grid item xs={4} className={classes.contactsWrapper}>
						<TicketsList />
					</Grid>
					<Grid item xs={8} className={classes.messagessWrapper}>
						{ticketId ? (
							<>
								<MessagesList />
							</>
						) : (
							<Paper square variant="outlined" className={classes.welcomeMsg}>
								<span>Selecione um contato para começar a conversar</span>
							</Paper>
						)}
					</Grid>
				</Grid>
			</Paper>
		</div>
	);
};

export default Chat;
