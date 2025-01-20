import { Avatar, CardHeader } from "@mui/material";

import { i18n } from "../../translate/i18n";

interface Contact {
  profilePicUrl?: string;
  name?: string;
}

interface Ticket {
  id?: number;
  user?: {
    name: string;
  };
}

interface TicketInfoProps {
  contact?: Contact;
  ticket: Ticket;
  onClick: () => void;
}

const TicketInfo: React.FC<TicketInfoProps> = ({
  contact,
  ticket,
  onClick,
}) => {
  return (
    <CardHeader
      onClick={onClick}
      style={{ cursor: "pointer" }}
      titleTypographyProps={{ noWrap: true }}
      subheaderTypographyProps={{ noWrap: true }}
      avatar={<Avatar src={contact.profilePicUrl} alt="contact_image" />}
      title={`${contact.name} #${ticket.id}`}
      subheader={
        ticket.user &&
        `${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name}`
      }
    />
  );
};

export default TicketInfo;
