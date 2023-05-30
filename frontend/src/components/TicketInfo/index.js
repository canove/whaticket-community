import React from "react";
import { useTranslation } from "react-i18next";

import { Avatar, CardHeader } from "@material-ui/core";

const TicketInfo = ({ contact, ticket, onClick, isBlocked }) => {
	const { i18n } = useTranslation();

	return (
		<CardHeader
			onClick={onClick}
			style={{ cursor: "pointer" }}
			titleTypographyProps={{ noWrap: true }}
			subheaderTypographyProps={{ noWrap: true }}
			avatar={<Avatar src={contact.profilePicUrl} alt="contact_image" />}
			title={`${contact.name}${isBlocked ? " [BLOQUEADO] " : " "}#${ticket.id}`}
			subheader={
				ticket.user &&
				`${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name}`
			}
		/>
	);
};

export default TicketInfo;
