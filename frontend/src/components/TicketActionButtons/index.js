import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import { Button, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { MoreVert, Replay } from "@material-ui/icons";

import GroupAddIcon from "@material-ui/icons/GroupAdd";

import Badge from "@material-ui/core/Badge";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import AddCategoryToTicketModal from "../AddCategoryToTicketModal";

import ButtonWithSpinner from "../ButtonWithSpinner";
import TicketOptionsMenu from "../TicketOptionsMenu";

const useStyles = makeStyles((theme) => ({
  actionButtons: {
    marginRight: 6,
    flex: "none",
    alignSelf: "center",
    marginLeft: "auto",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

const TicketActionButtons = ({ ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addCategoryToTicketModalOpen, setAddCategoryToTicketModalOpen] =
    useState(false);
  const ticketOptionsMenuOpen = Boolean(anchorEl);
  const { user } = useContext(AuthContext);

  const handleOpenTicketOptionsMenu = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseTicketOptionsMenu = (e) => {
    setAnchorEl(null);
  };

  const handleUpdateTicketStatus = async (e, status, userId) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: status,
        userId: userId || null,
      });

      if (status === "open") {
        await api.post(`/privateMessages/${ticket.id}`, {
          body: `${user?.name} *aceptó* la conversación`,
        });
      }

      if (status === "closed") {
        await api.post(`/privateMessages/${ticket.id}`, {
          body: `${user?.name} *resolvió* la conversación`,
        });
      }

      if (status === "pending") {
        await api.post(`/privateMessages/${ticket.id}`, {
          body: `${user?.name} *devolvió* la conversación`,
        });
      }

      setLoading(false);
      if (status === "open") {
        history.push(`/tickets/${ticket.id}`);
      } else {
        history.push("/tickets");
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  return (
    <div className={classes.actionButtons}>
      {ticket.status === "closed" && (
        <ButtonWithSpinner
          loading={loading}
          startIcon={<Replay />}
          size="small"
          onClick={(e) => handleUpdateTicketStatus(e, "open", user?.id)}
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
            onClick={(e) => handleUpdateTicketStatus(e, "pending", null)}
          >
            {i18n.t("messagesList.header.buttons.return")}
          </ButtonWithSpinner>
          <ButtonWithSpinner
            loading={loading}
            size="small"
            variant="contained"
            color="primary"
            onClick={(e) => handleUpdateTicketStatus(e, "closed", user?.id)}
          >
            {i18n.t("messagesList.header.buttons.resolve")}
          </ButtonWithSpinner>

          <Badge
            badgeContent={ticket.categories.length}
            invisible={ticket.categories.length < 1}
            color="primary"
          >
            <Button
              variant="contained"
              size="small"
              color="default"
              onClick={() => {
                setAddCategoryToTicketModalOpen(true);
              }}
            >
              Categorias
            </Button>
          </Badge>
          <AddCategoryToTicketModal
            modalOpen={addCategoryToTicketModalOpen}
            onClose={() => {
              setAddCategoryToTicketModalOpen(false);
            }}
            ticket={ticket}
          />

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
          onClick={(e) => handleUpdateTicketStatus(e, "open", user?.id)}
        >
          <GroupAddIcon style={{ marginRight: 6 }} />

          {i18n.t("messagesList.header.buttons.accept")}
        </ButtonWithSpinner>
      )}
    </div>
  );
};

export default TicketActionButtons;
