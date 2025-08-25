import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";

import { styled } from '@mui/material/styles';
import { green } from "@mui/material/colors";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@mui/material";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

const StyledListItem = styled(ListItem, {
	shouldForwardProp: (prop) => prop !== 'pending'
})(({ pending }) => ({
	position: "relative",
	cursor: pending ? "unset" : "pointer",
}));

const StyledContactNameWrapper = styled(Box)(() => ({
	display: "flex",
	justifyContent: "space-between",
}));

const StyledLastMessageTime = styled(Typography)(() => ({
	justifySelf: "flex-end",
}));

const StyledClosedBadge = styled(Badge)(() => ({
	alignSelf: "center",
	justifySelf: "flex-end",
	marginRight: 32,
	marginLeft: "auto",
}));

const StyledContactLastMessage = styled(Typography)(() => ({
	paddingRight: 20,
}));


const StyledBadgeContent = styled(Badge)(() => ({
	'& .MuiBadge-badge': {
		color: "white",
		backgroundColor: green[500],
	}
}));

const StyledAcceptButton = styled(ButtonWithSpinner)(() => ({
	position: "absolute",
	left: "50%",
}));

const StyledTicketQueueColor = styled(Box)(({ bgcolor }) => ({
	flex: "none",
	width: "8px",
	height: "100%",
	position: "absolute",
	top: "0%",
	left: "0%",
	backgroundColor: bgcolor || "#7C7C7C",
}));

const StyledUserTag = styled(Box)(() => ({
	position: "absolute",
	marginRight: 5,
	right: 5,
	bottom: 5,
	background: "#2576D2",
	color: "#ffffff",
	border: "1px solid #CCC",
	padding: 1,
	paddingLeft: 5,
	paddingRight: 5,
	borderRadius: 10,
	fontSize: "0.9em"
}));

const TicketListItem = ({ ticket }) => {
	const history = useHistory();
	const [loading, setLoading] = useState(false);
	const { ticketId } = useParams();
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleAcepptTicket = async id => {
		setLoading(true);
		try {
			await api.put(`/tickets/${id}`, {
				status: "open",
				userId: user?.id,
			});
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
		if (isMounted.current) {
			setLoading(false);
		}
		history.push(`/tickets/${id}`);
	};

	const handleSelectTicket = id => {
		history.push(`/tickets/${id}`);
	};

	return (
		<React.Fragment key={ticket.id}>
			<StyledListItem
				dense
				button
				pending={ticket.status === "pending"}
				onClick={e => {
					if (ticket.status === "pending") return;
					handleSelectTicket(ticket.id);
				}}
				selected={ticketId && +ticketId === ticket.id}
			>
				<Tooltip
					arrow
					placement="right"
					title={ticket.queue?.name || "Sem fila"}
				>
					<StyledTicketQueueColor bgcolor={ticket.queue?.color} />
				</Tooltip>
				<ListItemAvatar>
					<Avatar src={ticket?.contact?.profilePicUrl} />
				</ListItemAvatar>
				<ListItemText
					disableTypography
					primary={
						<StyledContactNameWrapper>
							<Typography
								noWrap
								component="span"
								variant="body2"
								color="textPrimary"
							>
								{ticket.contact.name}
							</Typography>
							{ticket.status === "closed" && (
								<StyledClosedBadge
									badgeContent={"closed"}
									color="primary"
								/>
							)}
							{ticket.lastMessage && (
								<StyledLastMessageTime
									component="span"
									variant="body2"
									color="textSecondary"
								>
									{isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
										<>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
									) : (
										<>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
									)}
								</StyledLastMessageTime>
							)}
							{ticket.whatsappId && (
								<StyledUserTag title={i18n.t("ticketsList.connectionTitle")}>
									{ticket.whatsapp?.name}
								</StyledUserTag>
							)}
						</StyledContactNameWrapper>
					}
					secondary={
						<StyledContactNameWrapper>
							<StyledContactLastMessage
								noWrap
								component="span"
								variant="body2"
								color="textSecondary"
							>
								{ticket.lastMessage ? (
									<MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
								) : (
									<br />
								)}
							</StyledContactLastMessage>

							<StyledBadgeContent
								badgeContent={ticket.unreadMessages}
							/>
						</StyledContactNameWrapper>
					}
				/>
				{ticket.status === "pending" && (
					<StyledAcceptButton
						color="primary"
						variant="contained"
						size="small"
						loading={loading}
						onClick={e => handleAcepptTicket(ticket.id)}
					>
						{i18n.t("ticketsList.buttons.accept")}
					</StyledAcceptButton>
				)}
			</StyledListItem>
			<Divider variant="inset" component="li" />
		</React.Fragment>
	);
};

export default TicketListItem;
