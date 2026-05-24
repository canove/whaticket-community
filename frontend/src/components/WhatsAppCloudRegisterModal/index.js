import React, { useState } from "react";
import { toast } from "react-toastify";
import makeStyles from '@mui/styles/makeStyles';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";

import api from "../../services/api";
import toastError from "../../errors/toastError";

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
    background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
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
    background: "rgba(249,115,22,0.05)",
    border: "1px solid rgba(249,115,22,0.2)",
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
      "&:hover fieldset": { borderColor: "#F97316" },
      "&.Mui-focused fieldset": { borderColor: "#F97316", borderWidth: 1.5 },
    },
    "& .MuiInputLabel-outlined": {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 14,
      color: "#9BA3B0",
    },
    "& .MuiInputLabel-outlined.Mui-focused": { color: "#F97316" },
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

  registerBtn: {
    borderRadius: 11,
    background: "linear-gradient(135deg, #F97316, #EA580C)",
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
      background: "linear-gradient(135deg, #EA580C, #C2410C)",
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

const WhatsAppCloudRegisterModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");

  const handleClose = () => {
    setPin("");
    setLoading(false);
    onClose();
  };

  const handlePinChange = (e) => {
    setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
  };

  const handleRegister = async () => {
    if (pin.length !== 6) return;
    setLoading(true);
    try {
      await api.post("/whatsapp-cloud/register", { whatsappId: whatsAppId, pin });
      toast.success("Número registrado com sucesso na Cloud API!");
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
        <div className={classes.wacIcon}>🔑</div>
        <div>
          <p className={classes.titleText}>Registrar número na Cloud API</p>
          <p className={classes.subtitle}>Necessário uma vez por número</p>
        </div>
      </div>

      <DialogContent className={classes.dialogContent}>
        <div className={classes.infoBox}>
          <p className={classes.infoTitle}>Apenas para contas Tech Provider/SI</p>
          <p className={classes.infoText}>
            Use este registro se sua conta é <strong>Tech Provider</strong> ou <strong>Solution Integrator</strong>.
            Informe o PIN de verificação em duas etapas configurado no WhatsApp Manager.
          </p>
        </div>

        <div className={classes.infoBox} style={{ background: "rgba(99,102,241,0.05)", borderColor: "rgba(99,102,241,0.2)" }}>
          <p className={classes.infoTitle}>Conta SMB (WhatsApp Business)?</p>
          <p className={classes.infoText}>
            O endpoint <code>/register</code> não funciona para SMB. O registro é automático
            via WhatsApp Manager. Acesse{" "}
            <a
              href="https://business.facebook.com/wa/manage/phone-numbers"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#6366F1", fontWeight: 600 }}
            >
              business.facebook.com/wa/manage
            </a>
            , abra o número, complete a verificação SMS/voz e configure o PIN de 2FA.
            Após isso, mensagens funcionam sem precisar registrar aqui.
          </p>
        </div>

        <TextField
          label="PIN de 6 dígitos"
          variant="outlined"
          size="small"
          fullWidth
          className={classes.field}
          value={pin}
          onChange={handlePinChange}
          placeholder="000000"
          inputProps={{ inputMode: "numeric", maxLength: 6 }}
          helperText={`${pin.length}/6 dígitos`}
        />
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose} disabled={loading} variant="outlined" className={classes.cancelBtn}>
          Cancelar
        </Button>
        <Button onClick={handleRegister} disabled={loading || pin.length !== 6} variant="contained" className={classes.registerBtn}>
          Registrar
          {loading && <CircularProgress size={18} className={classes.buttonProgress} />}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WhatsAppCloudRegisterModal;
