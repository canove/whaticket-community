import React from "react";

import { Avatar, CardHeader } from "@material-ui/core";

import { i18n } from "../../translate/i18n";

const TicketInfo = ({ contact, ticket, onClick }) => {
  return (
    <CardHeader
      onClick={onClick}
      style={{ cursor: "pointer" }}
      titleTypographyProps={{ noWrap: true }}
      subheaderTypographyProps={{ noWrap: true }}
      avatar={<Avatar src={contact.profilePicUrl} alt="contact_image" />}
      title={`${contact.name} #${ticket.id}`}
      subheader={
        <>
          <div>{`Conexión: ${ticket?.whatsapp?.name}`}</div>
          <div>
            {!ticket.isGroup &&
              ticket.user &&
              `${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name}`}
          </div>
          <div>
            {ticket.isGroup && ticket.participantUsers?.length > 0 && (
              <div>
                Participando:{" "}
                {ticket.participantUsers?.map((pu) => (
                  <span key={pu.id}>{pu.name} - </span>
                ))}
              </div>
            )}
          </div>
          <div>
            {contact.domain && (
              <a href={contact.domain} target="_blank">
                {contact.domain}
              </a>
            )}
          </div>
        </>
      }
    />
  );
};

export default TicketInfo;
