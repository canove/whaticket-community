import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import makeStyles from '@mui/styles/makeStyles';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import connectToSocket from "../../services/socket-io";

const useStyles = makeStyles(() => ({
  dialogTitle: {
    padding: "24px 24px 0",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  igIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    background:
      "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  titleText: {
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 18,
    color: "#0A0F1E",
    letterSpacing: "-0.3px",
    margin: 0,
  },

  subtitle: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12,
    color: "#9BA3B0",
    margin: 0,
  },

  dialogContent: {
    padding: "20px 24px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  infoBox: {
    background: "rgba(220, 39, 67, 0.05)",
    border: "1px solid rgba(220, 39, 67, 0.15)",
    borderRadius: 10,
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  infoTitle: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 13,
    color: "#0A0F1E",
    margin: 0,
  },

  infoText: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12,
    color: "#78716C",
    lineHeight: 1.6,
    margin: 0,
  },

  step: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },

  stepNum: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #dc2743, #bc1888)",
    color: "#fff",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },

  stepText: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 1.5,
    margin: 0,
  },

  waitingBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#F7F8FA",
    borderRadius: 10,
    padding: "10px 14px",
  },

  waitingText: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 13,
    color: "#6B7280",
    margin: 0,
  },

  dialogActions: {
    padding: "12px 24px 20px",
    gap: 10,
  },

  cancelBtn: {
    borderRadius: 11,
    border: "1px solid #E5E9EF",
    color: "#9BA3B0",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",
    height: 40,
    padding: "0 20px",
    backgroundColor: "transparent",
    boxShadow: "none",
    "&:hover": { backgroundColor: "#F7F8FA", boxShadow: "none" },
  },

  connectBtn: {
    borderRadius: 11,
    background:
      "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
    color: "#ffffff",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",
    height: 40,
    padding: "0 24px",
    boxShadow: "none",
    position: "relative",
    "&:hover": {
      background:
        "linear-gradient(135deg, #e0832a 0%, #d45a30 25%, #c42038 50%, #b81b5a 75%, #a61278 100%)",
      boxShadow: "none",
    },
    "&.Mui-disabled": { opacity: 0.7, color: "#ffffff" },
  },

  buttonProgress: {
    color: "#ffffff",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -9,
    marginLeft: -9,
  },
}));

const InstagramLoginModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const [waiting, setWaiting] = useState(false);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef(null);
  const socketRef = useRef(null);
  const pollRef = useRef(null);

  const handleClose = useCallback(() => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setWaiting(false);
    setLoading(false);
    onClose();
  }, [onClose]);

  // Subscribe to socket to detect CONNECTED status
  useEffect(() => {
    if (!open) return;

    const socket = connectToSocket();
    socketRef.current = socket;

    socket.on("whatsappSession", ({ action, session }) => {
      if (
        action === "update" &&
        session.id === whatsAppId &&
        session.status === "CONNECTED"
      ) {
        toast.success("Instagram conectado com sucesso!");
        handleClose();
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/instagram/oauth/url", {
        params: { whatsappId: whatsAppId },
      });

      const popup = window.open(
        data.url,
        "instagram_oauth",
        "width=620,height=720,left=200,top=100"
      );

      if (!popup) {
        toast.error("Popup bloqueado. Permita popups para este site.");
        setLoading(false);
        return;
      }

      popupRef.current = popup;
      setWaiting(true);
      setLoading(false);

      // Fallback: poll popup closed state
      pollRef.current = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          // Don't close the modal yet — wait for socket event
          // If no socket event arrives in 5s, stop waiting
          setTimeout(() => setWaiting(false), 5000);
        }
      }, 500);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 14,
          border: "1px solid #E5E9EF",
          boxShadow: "0 8px 32px rgba(10,15,30,0.10)",
        },
      }}
    >
      {/* Header */}
      <div className={classes.dialogTitle}>
        <div className={classes.igIcon}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="#fff" stroke="none" />
          </svg>
        </div>
        <div>
          <p className={classes.titleText}>Conectar Instagram</p>
          <p className={classes.subtitle}>Autorize via Facebook para continuar</p>
        </div>
      </div>

      <DialogContent className={classes.dialogContent}>
        {/* Requirements */}
        <div className={classes.infoBox}>
          <p className={classes.infoTitle}>Pré-requisitos</p>
          <p className={classes.infoText}>
            Sua conta Instagram deve ser <strong>Business ou Creator</strong> e estar
            vinculada a uma <strong>Página do Facebook</strong>.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className={classes.step}>
            <div className={classes.stepNum}>1</div>
            <p className={classes.stepText}>
              Clique em <strong>Conectar com Facebook</strong> abaixo.
            </p>
          </div>
          <div className={classes.step}>
            <div className={classes.stepNum}>2</div>
            <p className={classes.stepText}>
              Faça login na sua conta Facebook e selecione a Página vinculada ao Instagram.
            </p>
          </div>
          <div className={classes.step}>
            <div className={classes.stepNum}>3</div>
            <p className={classes.stepText}>
              Conceda as permissões solicitadas. O popup fecha automaticamente ao concluir.
            </p>
          </div>
        </div>

        {/* Waiting indicator */}
        {waiting && (
          <div className={classes.waitingBox}>
            <CircularProgress size={16} style={{ color: "#dc2743" }} />
            <Typography className={classes.waitingText}>
              Aguardando autorização no popup…
            </Typography>
          </div>
        )}
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          className={classes.cancelBtn}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConnect}
          disabled={loading || waiting}
          variant="contained"
          className={classes.connectBtn}
        >
          Conectar com Facebook
          {loading && (
            <CircularProgress size={18} className={classes.buttonProgress} />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstagramLoginModal;
