import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import ContactsHeader from "./components/ContactsHeader/ContactsHeader";
import ContactsList from "./components/ContactsList/ContactsList";
import MessagesList from "./components/MessagesList/MessagesList";
import MessagesInput from "./components/MessagesInput/MessagesInput";

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
	},
	welcomeMsg: {
		backgroundColor: "#eee",
		// display: "flex",
		// flex: 1,
		// alignItems: "center",
		height: 626,
		textAlign: "center",
	},
}));

const Chat2 = () => {
	const classes = useStyles();
	const [selectedContact, setSelectedContact] = useState(null);

	return (
		<div>
			<Container maxWidth="lg">
				<br></br>
				<Grid container spacing={0}>
					<Grid item xs={4}>
						<ContactsHeader />
						<ContactsList setSelectedContact={setSelectedContact} />
					</Grid>
					<Grid item xs={7}>
						{selectedContact ? (
							<>
								<MessagesList selectedContact={selectedContact} />
								<MessagesInput selectedContact={selectedContact} />
							</>
						) : (
							<Paper square className={classes.welcomeMsg}>
								Selecione um contato para começar a conversar
							</Paper>
						)}
					</Grid>
				</Grid>
			</Container>
		</div>
	);
};

export default Chat2;
