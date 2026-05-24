import React, { useEffect, useReducer, useState } from "react";

import openSocket from "../../services/socket-io";

import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { Trash2 as DeleteOutline, Pencil as Edit, PlusCircle as AddCircleOutlineIcon, GitBranch as AccountTreeOutlinedIcon } from "lucide-react";
import QueueModal from "../../components/QueueModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    margin: "0 24px 24px",
    borderRadius: 14,
    border: "1px solid #E5E9EF",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  tableScroll: {
    flex: 1,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },

  tableHead: {
    backgroundColor: "#F7F8FA",
    "& th": {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontWeight: 600,
      fontSize: 11,
      color: "#9BA3B0",
      letterSpacing: "0.6px",
      textTransform: "uppercase",
      borderBottom: "1px solid #E5E9EF",
      padding: "12px 16px",
    },
  },

  tableRow: {
    transition: "background 0.15s",
    "&:hover": {
      backgroundColor: "rgba(37, 211, 102, 0.04)",
    },
    "& td": {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 14,
      color: "#0A0F1E",
      borderBottom: "1px solid #F0F2F5",
      padding: "10px 16px",
    },
  },

  queueNameCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  colorDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
    border: "2px solid rgba(0,0,0,0.06)",
  },

  queueName: {
    fontWeight: 600,
    color: "#0A0F1E",
  },

  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "2px solid rgba(0,0,0,0.06)",
    display: "inline-block",
    flexShrink: 0,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },

  greetingText: {
    color: "#9BA3B0",
    fontSize: 13,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    maxWidth: 320,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
  },

  addButton: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 14,
    borderRadius: 11,
    background: "linear-gradient(135deg, #25D366 0%, #1DAB57 100%)",
    color: "#ffffff",
    boxShadow: "none",
    padding: "8px 20px",
    "&:hover": {
      background: "linear-gradient(135deg, #1DAB57 0%, #158A3E 100%)",
      boxShadow: "none",
    },
  },

  editBtn: {
    color: "#9BA3B0",
    padding: 6,
    "&:hover": {
      color: "#25D366",
      backgroundColor: "rgba(37, 211, 102, 0.08)",
    },
  },

  deleteBtn: {
    color: "#9BA3B0",
    padding: 6,
    "&:hover": {
      color: "#DC2626",
      backgroundColor: "rgba(220, 38, 38, 0.08)",
    },
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 24px",
    gap: 12,
  },

  emptyIcon: {
    fontSize: 48,
    color: "#E5E9EF",
  },

  emptyTitle: {
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 18,
    color: "#0A0F1E",
    margin: 0,
  },

  emptyText: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
    color: "#9BA3B0",
    margin: 0,
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_QUEUES") {
    const queues = action.payload;
    const newQueues = [];
    queues.forEach((queue) => {
      const queueIndex = state.findIndex((q) => q.id === queue.id);
      if (queueIndex !== -1) {
        state[queueIndex] = queue;
      } else {
        newQueues.push(queue);
      }
    });
    return [...state, ...newQueues];
  }

  if (action.type === "UPDATE_QUEUES") {
    const queue = action.payload;
    const queueIndex = state.findIndex((u) => u.id === queue.id);
    if (queueIndex !== -1) {
      state[queueIndex] = queue;
      return [...state];
    } else {
      return [queue, ...state];
    }
  }

  if (action.type === "DELETE_QUEUE") {
    const queueId = action.payload;
    const queueIndex = state.findIndex((q) => q.id === queueId);
    if (queueIndex !== -1) {
      state.splice(queueIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Queues = () => {
  const classes = useStyles();

  const [queues, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/queue");
        dispatch({ type: "LOAD_QUEUES", payload: data });
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const socket = openSocket();
    socket.on("queue", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUEUES", payload: data.queue });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUEUE", payload: data.queueId });
      }
    });
    return () => { socket.disconnect(); };
  }, []);

  const handleOpenQueueModal = () => {
    setQueueModalOpen(true);
    setSelectedQueue(null);
  };

  const handleCloseQueueModal = () => {
    setQueueModalOpen(false);
    setSelectedQueue(null);
  };

  const handleEditQueue = (queue) => {
    setSelectedQueue(queue);
    setQueueModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedQueue(null);
  };

  const handleDeleteQueue = async (queueId) => {
    try {
      await api.delete(`/queue/${queueId}`);
      toast.success(i18n.t("Queue deleted successfully!"));
    } catch (err) {
      toastError(err);
    }
    setSelectedQueue(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selectedQueue &&
          `${i18n.t("queues.confirmationModal.deleteTitle")} ${selectedQueue.name}?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteQueue(selectedQueue.id)}
      >
        {i18n.t("queues.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <QueueModal
        open={queueModalOpen}
        onClose={handleCloseQueueModal}
        queueId={selectedQueue?.id}
      />
      <MainHeader>
        <Title>{i18n.t("queues.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            className={classes.addButton}
            onClick={handleOpenQueueModal}
            startIcon={<AddCircleOutlineIcon size={18} />}
          >
            {i18n.t("queues.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <div className={classes.tableScroll}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>{i18n.t("queues.table.name")}</TableCell>
                <TableCell>{i18n.t("queues.table.color")}</TableCell>
                <TableCell>{i18n.t("queues.table.greeting")}</TableCell>
                <TableCell align="right">{i18n.t("queues.table.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queues.map((queue) => (
                <TableRow key={queue.id} className={classes.tableRow}>
                  <TableCell>
                    <div className={classes.queueNameCell}>
                      <span
                        className={classes.colorDot}
                        style={{ backgroundColor: queue.color }}
                      />
                      <span className={classes.queueName}>{queue.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={classes.colorSwatch}
                      style={{ backgroundColor: queue.color }}
                    />
                  </TableCell>
                  <TableCell>
                    <span className={classes.greetingText}>
                      {queue.greetingMessage || "—"}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      className={classes.editBtn}
                      onClick={() => handleEditQueue(queue)}
                    >
                      <Edit size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      className={classes.deleteBtn}
                      onClick={() => {
                        setSelectedQueue(queue);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutline size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </TableBody>
          </Table>

          {!loading && queues.length === 0 && (
            <div className={classes.emptyState}>
              <AccountTreeOutlinedIcon size={48} className={classes.emptyIcon} />
              <p className={classes.emptyTitle}>Nenhuma fila cadastrada</p>
              <p className={classes.emptyText}>
                Adicione a primeira fila clicando no botão acima
              </p>
            </div>
          )}
        </div>
      </Paper>
    </MainContainer>
  );
};

export default Queues;
