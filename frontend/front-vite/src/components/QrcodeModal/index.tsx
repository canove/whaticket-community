import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import openSocket from "../../services/socket-io";
import toastError from "../../errors/toastError";

import { Dialog, DialogContent, Paper, Typography } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import type { Error } from "../../types/Error";

interface QrcodeModalProps {
  open: boolean;
  onClose: () => void;
  whatsAppId: string;
}

const QrcodeModal: React.FC<QrcodeModalProps> = ({
  open,
  onClose,
  whatsAppId,
}) => {
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}`);
        setQrCode(data.qrcode);
      } catch (err) {
        toastError(err as Error);
      }
    };
    fetchSession();
  }, [whatsAppId]);

  useEffect(() => {
    if (!whatsAppId) return;
    const socket = openSocket();

    socket.on("whatsappSession", (data) => {
      if (data.action === "update" && data.session.id === whatsAppId) {
        setQrCode(data.session.qrcode);
      }

      if (data.action === "update" && data.session.qrcode === "") {
        onClose();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [whatsAppId, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" scroll="paper">
      <DialogContent>
        <Paper elevation={0}>
          <Typography color="primary" gutterBottom>
            {i18n.t("qrCode.message")}
          </Typography>
          {qrCode ? (
            <QRCodeCanvas value={qrCode} size={256} />
          ) : (
            <span>Waiting for QR Code</span>
          )}
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(QrcodeModal);
