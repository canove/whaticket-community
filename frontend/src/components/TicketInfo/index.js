import React from "react";

import { Avatar, CardHeader } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	queueStrip: {
		position: "absolute",
		top: 0,
		left: 0,
		width: 8,
		height: "100%",
		backgroundColor: theme.palette.queue.fallback,
	},
}));

const TicketInfo = ({ contact, ticket, onClick }) => {
	const classes = useStyles();

	return (
		<>
			<span
				className={classes.queueStrip}
				style={{ backgroundColor: ticket.queue?.color }}
			/>
			<CardHeader
				onClick={onClick}
				style={{ cursor: "pointer" }}
				titleTypographyProps={{ noWrap: true }}
				subheaderTypographyProps={{ noWrap: true }}
				avatar={
					<Avatar src={contact.profilePicUrl} alt="contact_image">
						{contact.name?.charAt(0)}
					</Avatar>
				}
				title={`${contact.name} #${ticket.id}`}
				subheader={
					ticket.user &&
					`${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name}`
				}
			/>
		</>
	);
};

export default TicketInfo;
