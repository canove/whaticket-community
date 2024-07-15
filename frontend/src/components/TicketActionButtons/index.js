import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import { Button, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { MoreVert, Replay } from "@material-ui/icons";

import GroupAddIcon from "@material-ui/icons/GroupAdd";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

import AskForHelpTicketModal from "../AskForHelpTicketModal";
import AskForParticipationTicketModal from "../AskForParticipationTicketModal";
import CloseTicketModal from "../CloseTicketModal";

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
  const [closeTicketModalOpen, setCloseTicketModalOpen] = useState(false);
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

  const handleUpdateTicketStatus = async ({
    status,
    userId,
    withFarewellMessage = true,
    comment = "",
  }) => {
    // setLoading(true);

    console.log(
      "handleUpdateTicketStatus",
      status,
      userId,
      withFarewellMessage,
      comment
    );

    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: status,
        userId: userId || null,
        ...(status === "closed" && { withFarewellMessage }),
      });

      if (status === "open") {
        await api.post(`/privateMessages/${ticket.id}`, {
          body: `${user?.name} *aceptó* la conversación`,
        });
      }

      if (status === "closed") {
        await api.post(`/privateMessages/${ticket.id}`, {
          body: `${user?.name} *resolvió* la conversación${
            comment ? ` con el *comentario*: ${comment}` : ""
          }`,
        });
      }

      if (status === "pending") {
        await api.post(`/privateMessages/${ticket.id}`, {
          body: `${user?.name} *devolvió* la conversación`,
        });
      }

      setLoading(false);
      if (status === "open") {
        console.log(`/tickets/${ticket.id}`);
        history.push(`/tickets/${ticket.id}`);
      } else {
        console.log("/tickets");
        history.push("/tickets");
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  return (
    <div className={classes.actionButtons}>
      {!ticket.isGroup && (
        <>
          {ticket.status === "closed" && (
            <>
              <ButtonWithSpinner
                loading={loading}
                startIcon={<Replay />}
                size="small"
                onClick={(e) =>
                  handleUpdateTicketStatus({
                    status: "open",
                    userId: user?.id,
                  })
                }
              >
                {i18n.t("messagesList.header.buttons.reopen")}
              </ButtonWithSpinner>
            </>
          )}

          {ticket.status === "open" && (
            <>
              {/* <Badge
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
          </Badge> */}

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

              {(ticket.userId === user?.id || user?.profile === "admin") && (
                <>
                  <ButtonWithSpinner
                    loading={loading}
                    startIcon={<Replay />}
                    size="small"
                    onClick={(e) =>
                      handleUpdateTicketStatus({
                        status: "pending",
                        userId: null,
                      })
                    }
                  >
                    {i18n.t("messagesList.header.buttons.return")}
                  </ButtonWithSpinner>

                  <ButtonWithSpinner
                    loading={loading}
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      setCloseTicketModalOpen(true);
                    }}
                  >
                    {i18n.t("messagesList.header.buttons.resolve")}
                  </ButtonWithSpinner>

                  <CloseTicketModal
                    modalOpen={closeTicketModalOpen}
                    onClose={() => {
                      setCloseTicketModalOpen(false);
                    }}
                    onSubmit={async ({ withFarewellMessage, comment }) => {
                      await handleUpdateTicketStatus({
                        status: "closed",
                        userId: user?.id,
                        withFarewellMessage,
                        comment,
                      });
                    }}
                  />

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
                          helpUsersIds: ticket.helpUsers
                            .filter((hu) => hu.id !== user?.id)
                            .map((pu) => pu.id),
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

              {(ticket.userId === user?.id || user?.profile === "admin") && (
                <IconButton onClick={handleOpenTicketOptionsMenu}>
                  <MoreVert />
                </IconButton>
              )}
            </>
          )}
          {ticket.status === "pending" && (
            <ButtonWithSpinner
              loading={loading}
              size="small"
              variant="contained"
              color="primary"
              onClick={(e) =>
                handleUpdateTicketStatus({ status: "open", userId: user?.id })
              }
            >
              <GroupAddIcon style={{ marginRight: 6 }} />

              {i18n.t("messagesList.header.buttons.accept")}
            </ButtonWithSpinner>
          )}
        </>
      )}

      {ticket.isGroup && ticket.status === "open" && (
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

          <IconButton onClick={handleOpenTicketOptionsMenu}>
            <MoreVert />
          </IconButton>

          <AskForParticipationTicketModal
            modalOpen={askForParticipationTicketModalOpen}
            onClose={() => {
              setAskForParticipationTicketModalOpen(false);
            }}
            ticket={ticket}
          />
        </>
      )}

      <TicketOptionsMenu
        ticket={ticket}
        anchorEl={anchorEl}
        menuOpen={ticketOptionsMenuOpen}
        handleClose={handleCloseTicketOptionsMenu}
      />
    </div>
  );
};

export default TicketActionButtons;
