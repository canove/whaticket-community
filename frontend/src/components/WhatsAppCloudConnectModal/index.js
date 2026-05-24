import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import makeStyles from '@mui/styles/makeStyles';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
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

  wacIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: 22,
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
    background: "rgba(37,211,102,0.05)",
    border: "1px solid rgba(37,211,102,0.2)",
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

  field: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 14,
      "& fieldset": { borderColor: "#E5E9EF" },
      "&:hover fieldset": { borderColor: "#25D366" },
      "&.Mui-focused fieldset": { borderColor: "#25D366", borderWidth: 1.5 },
    },
    "& .MuiInputLabel-outlined": {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 14,
      color: "#9BA3B0",
    },
    "& .MuiInputLabel-outlined.Mui-focused": { color: "#25D366" },
    "& .MuiFormHelperText-root": {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 11,
    },
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
    background: "linear-gradient(135deg, #25D366, #128C7E)",
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
      background: "linear-gradient(135deg, #1DAB57, #0f7a6d)",
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

const WhatsAppCloudConnectModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phoneNumberId: "", wabaId: "", accessToken: "" });
  const socketRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const socket = connectToSocket();
    socketRef.current = socket;
    socket.on("whatsappSession", ({ action, session }) => {
      if (action === "update" && session.id === whatsAppId && session.status === "CONNECTED") {
        toast.success("WhatsApp Cloud conectado com sucesso!");
        handleClose();
      }
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    setForm({ phoneNumberId: "", wabaId: "", accessToken: "" });
    setLoading(false);
    onClose();
  };

  const handleConnect = async () => {
    if (!form.phoneNumberId || !form.wabaId || !form.accessToken) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/whatsapp-cloud/connect", {
        whatsappId: whatsAppId,
        ...form,
      });
      toast.success("WhatsApp Cloud conectado com sucesso!");
      handleClose();
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
      <div className={classes.dialogTitle}>
        <div className={classes.wacIcon}>☁️</div>
        <div>
          <p className={classes.titleText}>Conectar WhatsApp Cloud</p>
          <p className={classes.subtitle}>API oficial da Meta (sem celular)</p>
        </div>
      </div>

      <DialogContent className={classes.dialogContent}>
        <div className={classes.infoBox}>
          <p className={classes.infoTitle}>Onde encontrar as credenciais?</p>
          <p className={classes.infoText}>
            Acesse <strong>developers.facebook.com</strong> → seu app → WhatsApp → Configuração da API.
            O <strong>System User Token</strong> é gerado em <strong>business.facebook.com</strong> → Usuários do Sistema.
          </p>
        </div>

        <TextField
          label="Phone Number ID"
          variant="outlined"
          size="small"
          fullWidth
          className={classes.field}
          value={form.phoneNumberId}
          onChange={e => setForm(f => ({ ...f, phoneNumberId: e.target.value.trim() }))}
          placeholder="Ex: 123456789012345"
          helperText="Encontrado em: App → WhatsApp → Configuração da API"
        />

        <TextField
          label="WABA ID (WhatsApp Business Account ID)"
          variant="outlined"
          size="small"
          fullWidth
          className={classes.field}
          value={form.wabaId}
          onChange={e => setForm(f => ({ ...f, wabaId: e.target.value.trim() }))}
          placeholder="Ex: 987654321098765"
        />

        <TextField
          label="System User Access Token"
          variant="outlined"
          size="small"
          fullWidth
          multiline
          rows={3}
          className={classes.field}
          value={form.accessToken}
          onChange={e => setForm(f => ({ ...f, accessToken: e.target.value.trim() }))}
          placeholder="EAABwzLixnjYBO..."
          helperText="Token permanente — não expira"
        />

        <Typography style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontSize: 11, color: "#9BA3B0" }}>
          Webhook: <code style={{ background: "#F7F8FA", padding: "1px 6px", borderRadius: 4 }}>{window.location.origin.replace("3000", "8080")}/whatsapp-cloud/webhook</code>
        </Typography>
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose} disabled={loading} variant="outlined" className={classes.cancelBtn}>
          Cancelar
        </Button>
        <Button onClick={handleConnect} disabled={loading} variant="contained" className={classes.connectBtn}>
          Conectar
          {loading && <CircularProgress size={18} className={classes.buttonProgress} />}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WhatsAppCloudConnectModal;
