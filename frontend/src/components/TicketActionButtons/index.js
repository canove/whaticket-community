import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import { Button, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { MoreVert, Replay } from "@material-ui/icons";

import GroupAddIcon from "@material-ui/icons/GroupAdd";

import Badge from "@material-ui/core/Badge";
import CategoryOutlinedIcon from "@material-ui/icons/CategoryOutlined";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

import AddCategoryToTicketModal from "../AddCategoryToTicketModal";
import AskForHelpTicketModal from "../AskForHelpTicketModal";
import AskForParticipationTicketModal from "../AskForParticipationTicketModal";

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
  const [askForHelpTicketModalOpen, setAskForHelpTicketModalOpen] =
    useState(false);
  const [
    askForParticipationTicketModalOpen,
    setAskForParticipationTicketModalOpen,
  ] = useState(false);
  const ticketOptionsMenuOpen = Boolean(anchorEl);
  const { user } = useContext(AuthContext);

  const handleOpenTicketOptionsMenu = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseTicketOptionsMenu = (e) => {
    setAnchorEl(null);
  };

  // useEffect(() => {
  //   console.log(">>>>>>><ticket", ticket);
  // }, [ticket]);

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
        <>
          {!ticket.isGroup ? (
            <ButtonWithSpinner
              loading={loading}
              startIcon={<Replay />}
              size="small"
              onClick={(e) => handleUpdateTicketStatus(e, "open", user?.id)}
            >
              {i18n.t("messagesList.header.buttons.reopen")}
            </ButtonWithSpinner>
          ) : (
            <></>
            // <ButtonWithSpinner
            //   loading={loading}
            //   startIcon={<Replay />}
            //   size="small"
            //   onClick={async () => {
            //     try {
            //       await api.put(`/tickets/${ticket.id}`, {
            //         status: "open",
            //       });

            //       await api.post(`/privateMessages/${ticket.id}`, {
            //         body: `${user?.name} *Devolvió a bandeja* la conversación`,
            //       });
            //       history.push(`/tickets/${ticket.id}`);
            //     } catch (err) {
            //       toastError(err);
            //     }
            //   }}
            // >
            //   Devolver a bandeja
            // </ButtonWithSpinner>
          )}
        </>
      )}

      {ticket.status === "open" && (
        <>
          {(ticket.userId === user?.id || user?.profile === "admin") &&
            !ticket.isGroup && (
              <ButtonWithSpinner
                loading={loading}
                startIcon={<Replay />}
                size="small"
                onClick={(e) => handleUpdateTicketStatus(e, "pending", null)}
              >
                {i18n.t("messagesList.header.buttons.return")}
              </ButtonWithSpinner>
            )}

          <Badge
            badgeContent={ticket.categories.length}
            invisible={ticket.categories.length < 1}
            color="primary"
          >
            <div>
              <Button
                size="small"
                onClick={() => {
                  setAddCategoryToTicketModalOpen(true);
                }}
                startIcon={<CategoryOutlinedIcon />}
              >
                Categorias
              </Button>
            </div>
          </Badge>

          {/* {ticket.isGroup && (
            <ButtonWithSpinner
              loading={loading}
              startIcon={<Replay />}
              size="small"
              onClick={async () => {
                try {
                  await api.put(`/tickets/${ticket.id}`, {
                    status: "closed",
                  });

                  await api.post(`/privateMessages/${ticket.id}`, {
                    body: `${user?.name} *Envio a resueltos* la conversación`,
                  });
                  history.push(`/tickets`);
                } catch (err) {
                  toastError(err);
                }
              }}
            >
              Enviar a resueltos
            </ButtonWithSpinner>
          )} */}

          {(ticket.userId === user?.id || user?.profile === "admin") &&
            !ticket.isGroup && (
              <>
                <ButtonWithSpinner
                  loading={loading}
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={(e) =>
                    handleUpdateTicketStatus(e, "closed", user?.id)
                  }
                >
                  {i18n.t("messagesList.header.buttons.resolve")}
                </ButtonWithSpinner>

                <Button
                  size="small"
                  variant="contained"
                  color="default"
                  onClick={() => setAskForHelpTicketModalOpen(true)}
                >
                  Pedir apoyo
                </Button>
              </>
            )}

          {ticket.helpUsers?.find((hu) => hu.id === user?.id) && (
            <>
              <Button
                size="small"
                variant="contained"
                color="default"
                onClick={async () => {
                  try {
                    await api.put(`/tickets/${ticket.id}`, {
                      helpUsersIds: ticket.helpUsers.filter(
                        (hu) => hu.id !== user?.id
                      ),
                    });

                    await api.post(`/privateMessages/${ticket.id}`, {
                      body: `${user?.name} *terminó el apoyo* en la conversación`,
                    });
                    history.push(`/tickets`);
                  } catch (err) {
                    toastError(err);
                  }
                }}
              >
                Terminar apoyo
              </Button>
            </>
          )}

          <AskForHelpTicketModal
            modalOpen={askForHelpTicketModalOpen}
            onClose={() => {
              setAskForHelpTicketModalOpen(false);
            }}
            ticket={ticket}
          />

          <AddCategoryToTicketModal
            modalOpen={addCategoryToTicketModalOpen}
            onClose={() => {
              setAddCategoryToTicketModalOpen(false);
            }}
            ticket={ticket}
          />

          {(ticket.userId === user?.id || user?.profile === "admin") &&
            !ticket.isGroup && (
              <IconButton onClick={handleOpenTicketOptionsMenu}>
                <MoreVert />
              </IconButton>
            )}

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

      {ticket.isGroup && (
        <>
          {ticket.participantUsers?.find((pu) => pu.id === user?.id) ? (
            <ButtonWithSpinner
              loading={loading}
              size="small"
              variant="contained"
              color="primary"
              onClick={async () => {
                try {
                  await api.put(`/tickets/${ticket.id}`, {
                    participantUsersIds: ticket.participantUsers
                      .filter((pu) => pu.id !== user?.id)
                      .map((pu) => pu.id),
                  });

                  await api.post(`/privateMessages/${ticket.id}`, {
                    body: `${user?.name} *Terminó su participación* en la conversación`,
                  });
                  history.push(`/tickets`);
                } catch (err) {
                  toastError(err);
                }
              }}
            >
              Terminar participación
            </ButtonWithSpinner>
          ) : (
            <ButtonWithSpinner
              loading={loading}
              size="small"
              variant="contained"
              color="primary"
              onClick={async () => {
                try {
                  await api.put(`/tickets/${ticket.id}`, {
                    participantUsersIds: [
                      ...ticket.participantUsers.map((pu) => pu.id),
                      user?.id,
                    ],
                  });

                  await api.post(`/privateMessages/${ticket.id}`, {
                    body: `${user?.name} *Empezó a participar* en la conversación`,
                  });
                } catch (err) {
                  toastError(err);
                }
              }}
            >
              <GroupAddIcon style={{ marginRight: 6 }} />
              Empezar participación
            </ButtonWithSpinner>
          )}

          <Button
            size="small"
            variant="contained"
            color="default"
            onClick={() => {
              setAskForParticipationTicketModalOpen(true);
            }}
          >
            Pedir participación
          </Button>

          <AskForParticipationTicketModal
            modalOpen={askForParticipationTicketModalOpen}
            onClose={() => {
              setAskForParticipationTicketModalOpen(false);
            }}
            ticket={ticket}
          />
        </>
      )}
    </div>
  );
};

export default TicketActionButtons;
