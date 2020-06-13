import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Avatar from "@material-ui/core/Avatar";

import profileDefaultPic from "../../../../Images/profile_default.png";

const useStyles = makeStyles(theme => ({
	contactsHeader: {
		display: "flex",
		flex: "none",
		// height: 80,
		backgroundColor: "#eee",
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
		borderTopRightRadius: 0,
	},
	settingsIcon: {
		alignSelf: "center",
		marginLeft: "auto",
		padding: 8,
	},
}));

const ContactsHeader = () => {
	const classes = useStyles();

	const username = localStorage.getItem("username");

	return (
		<Card variant="outlined" square className={classes.contactsHeader}>
			<CardHeader
				avatar={<Avatar alt="logged_user" src={profileDefaultPic} />}
				title={username}
			/>
			<IconButton className={classes.settingsIcon} aria-label="settings">
				<MoreVertIcon />
			</IconButton>
		</Card>
	);
};

export default ContactsHeader;
