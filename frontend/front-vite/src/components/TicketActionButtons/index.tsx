import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { IconButton } from "@mui/material";
import { MoreVert, Replay } from "@mui/icons-material";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import TicketOptionsMenu from "../TicketOptionsMenu";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import type { Error } from "../../types/Error";
import { styled } from "@mui/material/styles";

const ActionButtonsStyle = styled("div")(({ theme }) => ({
  marginRight: 6,
  flex: "none",
  alignSelf: "center",
  marginLeft: "auto",
  "& > *": {
    margin: theme.spacing(1),
  },
}));

const TicketActionButtons = ({ ticket }: { ticket: any }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [loading, setLoading] = useState(false);
  const ticketOptionsMenuOpen = Boolean(anchorEl);
  const authContext = useContext(AuthContext);
  const user = authContext ? authContext.user : null;

  const handleOpenTicketOptionsMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseTicketOptionsMenu = () => {
    setAnchorEl(null);
  };

  const handleUpdateTicketStatus = async (_e: React.MouseEvent<HTMLButtonElement>, status: string, userId: number | null) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: status,
        userId: userId || null,
      });

      setLoading(false);
      if (status === "open") {
        navigate(`/tickets/${ticket.id}`);
      } else {
        navigate("/tickets");
      }
    } catch (err) {
      setLoading(false);
      toastError(err as Error);
    }
  };

  return (
    <ActionButtonsStyle>
      {ticket.status === "closed" && (
        <ButtonWithSpinner
          loading={loading}
          startIcon={<Replay />}
          size="small"
          onClick={(e: any) => handleUpdateTicketStatus(e, "open", user?.id)}
        >
          {i18n.t("messagesList.header.buttons.reopen")}
        </ButtonWithSpinner>
      )}
      {ticket.status === "open" && (
        <>
          <ButtonWithSpinner
            loading={loading}
            startIcon={<Replay />}
            size="small"
            onClick={(e: any) => handleUpdateTicketStatus(e, "pending", null)}
          >
            {i18n.t("messagesList.header.buttons.return")}
          </ButtonWithSpinner>
          <ButtonWithSpinner
            loading={loading}
            size="small"
            variant="contained"
            color="primary"
            onClick={(e: any) => handleUpdateTicketStatus(e, "closed", user?.id)}
          >
            {i18n.t("messagesList.header.buttons.resolve")}
          </ButtonWithSpinner>
          <IconButton onClick={handleOpenTicketOptionsMenu}>
            <MoreVert />
          </IconButton>
          <TicketOptionsMenu
            ticket={ticket}
            anchorEl={anchorEl}
            menuOpen={ticketOptionsMenuOpen}
            handleClose={handleCloseTicketOptionsMenu}
          />
        </>
      )}
      {ticket.status === "pending" && (
        <ButtonWithSpinner
          loading={loading}
          size="small"
          variant="contained"
          color="primary"
          onClick={(e: any) => handleUpdateTicketStatus(e, "open", user?.id)}
        >
          {i18n.t("messagesList.header.buttons.accept")}
        </ButtonWithSpinner>
      )}
    </ActionButtonsStyle>
  );
};

export default TicketActionButtons;
