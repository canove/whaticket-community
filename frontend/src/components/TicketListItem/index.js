import React from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";

import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import { Tooltip } from "@material-ui/core";

import { i18n } from "../../translate/i18n";

import MarkdownWrapper from "../MarkdownWrapper";

const useStyles = makeStyles(theme => ({
	ticket: {
		position: "relative",
		borderRadius: 12,
		margin: "2px 8px",
		padding: "10px 12px 10px 18px",
		alignItems: "center",
		"&:hover": {
			backgroundColor: theme.palette.action.hover,
		},
	},

	queueStripe: {
		position: "absolute",
		left: 7,
		top: 12,
		bottom: 12,
		width: 4,
		borderRadius: 4,
	},

	avatar: {
		width: 46,
		height: 46,
	},

	content: {
		flex: 1,
		minWidth: 0,
		marginLeft: 12,
		marginRight: 8,
	},

	topRow: {
		display: "flex",
		alignItems: "center",
		gap: 8,
	},

	name: {
		fontWeight: 600,
		flex: 1,
		minWidth: 0,
	},

	time: {
		fontSize: "0.72rem",
		color: theme.palette.text.secondary,
		flexShrink: 0,
	},

	bottomRow: {
		display: "flex",
		alignItems: "center",
		gap: 8,
		marginTop: 2,
	},

	preview: {
		flex: 1,
		minWidth: 0,
		color: theme.palette.text.secondary,
		fontSize: "0.82rem",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},

	connectionChip: {
		fontSize: "0.68rem",
		fontWeight: 600,
		color: theme.palette.primary.main,
		backgroundColor: theme.palette.action.hover,
		padding: "1px 8px",
		borderRadius: 999,
		flexShrink: 0,
		maxWidth: 96,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},

	unread: {
		minWidth: 20,
		height: 20,
		padding: "0 6px",
		borderRadius: 999,
		backgroundColor: theme.palette.secondary.main,
		color: theme.palette.secondary.contrastText,
		fontSize: "0.7rem",
		fontWeight: 700,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},

}));

const TicketListItem = ({ ticket }) => {
	const classes = useStyles();
	const history = useHistory();
	const { ticketId } = useParams();

	const handleSelectTicket = id => {
		history.push(`/tickets/${id}`);
	};

	return (
		<ListItem
			dense
			button
			onClick={() => handleSelectTicket(ticket.id)}
			selected={ticketId && +ticketId === ticket.id}
			className={classes.ticket}
		>
			<Tooltip arrow placement="right" title={ticket.queue?.name || "Sem fila"}>
				<span
					style={{ backgroundColor: ticket.queue?.color || "#C9D2CE" }}
					className={classes.queueStripe}
				/>
			</Tooltip>

			<Avatar
				src={ticket?.contact?.profilePicUrl}
				className={classes.avatar}
			/>

			<div className={classes.content}>
				<div className={classes.topRow}>
					<Typography noWrap variant="body2" className={classes.name}>
						{ticket.contact.name}
					</Typography>
					{ticket.lastMessage && (
						<span className={classes.time}>
							{isSameDay(parseISO(ticket.updatedAt), new Date())
								? format(parseISO(ticket.updatedAt), "HH:mm")
								: format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}
						</span>
					)}
				</div>

				<div className={classes.bottomRow}>
					<span className={classes.preview}>
						{ticket.lastMessage ? (
							<MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
						) : (
							" "
						)}
					</span>
					{ticket.whatsapp?.name && (
						<span
							className={classes.connectionChip}
							title={i18n.t("ticketsList.connectionTitle")}
						>
							{ticket.whatsapp.name}
						</span>
					)}
				</div>
			</div>

			{ticket.unreadMessages > 0 && (
				<span className={classes.unread}>{ticket.unreadMessages}</span>
			)}
		</ListItem>
	);
};

export default TicketListItem;
