import React from "react";

import { parseISO, format, isSameDay } from "date-fns";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import Button from "@material-ui/core/Button";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	ticket: {
		position: "relative",
		"& .hidden-button": {
			display: "none",
		},
		"&:hover .hidden-button": {
			display: "flex",
			position: "absolute",
			left: "50%",
		},
	},
	noTicketsDiv: {
		display: "flex",
		height: "100px",
		margin: 40,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},

	noTicketsText: {
		textAlign: "center",
		color: "rgb(104, 121, 146)",
		fontSize: "14px",
		lineHeight: "1.4",
	},

	noTicketsTitle: {
		textAlign: "center",
		fontSize: "16px",
		fontWeight: "600",
		margin: "0px",
	},

	contactNameWrapper: {
		display: "flex",
		justifyContent: "space-between",
	},

	lastMessageTime: {
		justifySelf: "flex-end",
	},

	closedBadge: {
		alignSelf: "center",
		justifySelf: "flex-end",
		marginRight: 32,
		marginLeft: "auto",
	},

	contactLastMessage: {
		paddingRight: 20,
	},

	newMessagesCount: {
		alignSelf: "center",
		marginRight: 8,
		marginLeft: "auto",
	},

	badgeStyle: {
		color: "white",
		backgroundColor: green[500],
	},
}));

const TicketListItem = ({
	ticket,
	handleAcepptTicket,
	handleSelectTicket,
	ticketId,
}) => {
	const classes = useStyles();

	return (
		<React.Fragment key={ticket.id}>
			<ListItem
				dense
				button
				onClick={e => {
					if (ticket.status === "pending" && handleAcepptTicket) return;
					handleSelectTicket(e, ticket);
				}}
				selected={ticketId && +ticketId === ticket.id}
				className={classes.ticket}
			>
				<ListItemAvatar>
					<Avatar
						src={ticket.contact.profilePicUrl && ticket.contact.profilePicUrl}
					></Avatar>
				</ListItemAvatar>
				<ListItemText
					primary={
						<span className={classes.contactNameWrapper}>
							<Typography
								noWrap
								component="span"
								variant="body2"
								color="textPrimary"
							>
								{ticket.contact.name}
							</Typography>
							{ticket.status === "closed" && (
								<Badge
									className={classes.closedBadge}
									badgeContent={"closed"}
									color="primary"
								/>
							)}
							{ticket.lastMessage && (
								<Typography
									className={classes.lastMessageTime}
									component="span"
									variant="body2"
									color="textSecondary"
								>
									{isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
										<>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
									) : (
										<>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
									)}
								</Typography>
							)}
						</span>
					}
					secondary={
						<span className={classes.contactNameWrapper}>
							<Typography
								className={classes.contactLastMessage}
								noWrap
								component="span"
								variant="body2"
								color="textSecondary"
							>
								{ticket.lastMessage || <br />}
							</Typography>

							<Badge
								className={classes.newMessagesCount}
								badgeContent={ticket.unreadMessages}
								classes={{
									badge: classes.badgeStyle,
								}}
							/>
						</span>
					}
				/>
				{ticket.status === "pending" && handleAcepptTicket ? (
					<Button
						variant="contained"
						size="small"
						color="primary"
						className="hidden-button"
						onClick={e => handleAcepptTicket(ticket.id)}
					>
						{i18n.t("ticketsList.buttons.accept")}
					</Button>
				) : null}
			</ListItem>
			<Divider variant="inset" component="li" />
		</React.Fragment>
	);
};

export default TicketListItem;
