import React, { useState, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

import makeStyles from '@mui/styles/makeStyles';
import {
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import { Pencil as Edit, CheckCircle2 as CheckCircle, WifiOff, PlusCircle as AddCircleOutline, Trash2 as DeleteOutline, RefreshCw as Sync } from "lucide-react";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import InstagramLoginModal from "../../components/InstagramLoginModal";
import WhatsAppCloudConnectModal from "../../components/WhatsAppCloudConnectModal";
import WhatsAppCloudRegisterModal from "../../components/WhatsAppCloudRegisterModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "28px 24px",
    backgroundColor: "#F7F8FA",
    minHeight: "100%",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },

  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },

  pageTitle: {
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 28,
    color: "#0A0F1E",
    letterSpacing: "-0.5px",
    margin: 0,
  },

  addBtn: {
    height: 42,
    borderRadius: 11,
    background: "linear-gradient(135deg, #25D366 0%, #1DAB57 100%)",
    color: "#ffffff",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: "0.1px",
    textTransform: "none",
    boxShadow: "0 4px 14px rgba(37,211,102,0.25)",
    paddingLeft: 20,
    paddingRight: 20,
    "&:hover": {
      background: "linear-gradient(135deg, #2BDC6E 0%, #20B85E 100%)",
      boxShadow: "0 6px 20px rgba(37,211,102,0.35)",
    },
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 16,
  },

  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #E5E9EF",
    borderRadius: 14,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    position: "relative",
    transition: "box-shadow 0.15s ease, border-color 0.15s ease",
    "&:hover": {
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      borderColor: "#d0d7e0",
    },
  },

  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    marginTop: 5,
    flexShrink: 0,
  },

  cardName: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 16,
    color: "#0A0F1E",
    margin: 0,
    lineHeight: 1.3,
  },

  defaultBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "rgba(37,211,102,0.1)",
    border: "1px solid rgba(37,211,102,0.25)",
    borderRadius: 100,
    padding: "2px 10px",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 11,
    color: "#1DAB57",
    letterSpacing: "0.4px",
    marginTop: 4,
    width: "fit-content",
  },

  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 100,
    padding: "4px 12px",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 12,
    width: "fit-content",
  },

  statusPillConnected: {
    background: "rgba(37,211,102,0.1)",
    color: "#1DAB57",
  },

  statusPillDisconnected: {
    background: "rgba(239,68,68,0.08)",
    color: "#DC2626",
  },

  statusPillQrcode: {
    background: "rgba(245,158,11,0.1)",
    color: "#D97706",
  },

  statusPillOpening: {
    background: "rgba(99,102,241,0.08)",
    color: "#4F46E5",
  },

  statusPillTimeout: {
    background: "rgba(245,158,11,0.08)",
    color: "#B45309",
  },

  statusPillWaitingLogin: {
    background: "rgba(245,158,11,0.10)",
    color: "#D97706",
  },

  statusPillChallenge: {
    background: "rgba(239,68,68,0.08)",
    color: "#DC2626",
  },

  channelBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    padding: "2px 8px",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 10,
    letterSpacing: "0.3px",
    marginTop: 2,
    width: "fit-content",
  },

  channelBadgeWhatsapp: {
    background: "rgba(37,211,102,0.08)",
    color: "#1DAB57",
  },

  channelBadgeInstagram: {
    background: "linear-gradient(135deg, rgba(240,148,51,0.12), rgba(188,24,136,0.12))",
    color: "#cc2366",
  },

  channelBadgeCloud: {
    background: "rgba(18,140,126,0.1)",
    color: "#128C7E",
  },

  cardMeta: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12,
    color: "#9BA3B0",
    margin: 0,
  },

  cardActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingTop: 12,
    borderTop: "1px solid #F0F2F5",
    flexWrap: "wrap",
  },

  sessionBtns: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },

  iconActions: {
    display: "flex",
    gap: 2,
  },

  iconBtn: {
    color: "#9BA3B0",
    "&:hover": {
      color: "#0A0F1E",
      backgroundColor: "rgba(37,211,102,0.06)",
    },
  },

  deleteBtn: {
    color: "#9BA3B0",
    "&:hover": {
      color: "#DC2626",
      backgroundColor: "rgba(239,68,68,0.06)",
    },
  },

  smBtn: {
    borderRadius: 9,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 12,
    textTransform: "none",
    height: 30,
    padding: "0 12px",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 40px",
    gap: 16,
    textAlign: "center",
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    background: "rgba(37,211,102,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    "& svg": {
      color: "#25D366",
      fontSize: 32,
    },
  },

  emptyTitle: {
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 22,
    color: "#0A0F1E",
    margin: 0,
  },

  emptyText: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
    color: "#9BA3B0",
    margin: 0,
    maxWidth: 320,
    lineHeight: 1.6,
  },
}));

const StatusPill = ({ whatsApp, classes }) => {
  const statusMap = {
    CONNECTED: { label: "Conectado", cls: classes.statusPillConnected, dot: "#25D366" },
    DISCONNECTED: { label: "Desconectado", cls: classes.statusPillDisconnected, dot: "#EF4444" },
    qrcode: { label: "Aguardando QR", cls: classes.statusPillQrcode, dot: "#F59E0B" },
    OPENING: { label: "Conectando...", cls: classes.statusPillOpening, dot: "#6366F1" },
    PAIRING: { label: "Pareando", cls: classes.statusPillTimeout, dot: "#F59E0B" },
    TIMEOUT: { label: "Timeout", cls: classes.statusPillTimeout, dot: "#F59E0B" },
    WAITING_LOGIN: { label: "Aguardando Conexão", cls: classes.statusPillWaitingLogin, dot: "#F59E0B" },
  };
  const info = statusMap[whatsApp.status] || { label: whatsApp.status, cls: "", dot: "#9BA3B0" };

  return (
    <span className={`${classes.statusPill} ${info.cls}`}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: info.dot, flexShrink: 0, display: "inline-block" }} />
      {whatsApp.status === "OPENING" ? (
        <><CircularProgress size={10} style={{ color: "#6366F1", marginRight: 2 }} />{info.label}</>
      ) : info.label}
    </span>
  );
};

const Connections = () => {
  const classes = useStyles();
  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [igLoginModalOpen, setIgLoginModalOpen] = useState(false);
  const [wacConnectModalOpen, setWacConnectModalOpen] = useState(false);
  const [wacRegisterModalOpen, setWacRegisterModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const confirmationModalInitialState = { action: "", title: "", message: "", whatsAppId: "", open: false };
  const [confirmModalInfo, setConfirmModalInfo] = useState(confirmationModalInitialState);

  const handleStartWhatsAppSession = async (whatsAppId) => {
    try { await api.post(`/whatsappsession/${whatsAppId}`); }
    catch (err) { toastError(err); }
  };

  const handleRequestNewQrCode = async (whatsAppId) => {
    try { await api.put(`/whatsappsession/${whatsAppId}`); }
    catch (err) { toastError(err); }
  };

  const handleOpenWhatsAppModal = () => { setSelectedWhatsApp(null); setWhatsAppModalOpen(true); };
  const handleCloseWhatsAppModal = useCallback(() => { setWhatsAppModalOpen(false); setSelectedWhatsApp(null); }, []);
  const handleOpenQrModal = (whatsApp) => { setSelectedWhatsApp(whatsApp); setQrModalOpen(true); };
  const handleCloseQrModal = useCallback(() => { setSelectedWhatsApp(null); setQrModalOpen(false); }, []);
  const handleEditWhatsApp = (whatsApp) => { setSelectedWhatsApp(whatsApp); setWhatsAppModalOpen(true); };
  const handleOpenIgLogin = (whatsApp) => { setSelectedWhatsApp(whatsApp); setIgLoginModalOpen(true); };
  const handleCloseIgLogin = useCallback(() => { setSelectedWhatsApp(null); setIgLoginModalOpen(false); }, []);
  const handleOpenWacConnect = (whatsApp) => { setSelectedWhatsApp(whatsApp); setWacConnectModalOpen(true); };
  const handleCloseWacConnect = useCallback(() => { setSelectedWhatsApp(null); setWacConnectModalOpen(false); }, []);
  const handleOpenWacRegister = (whatsApp) => { setSelectedWhatsApp(whatsApp); setWacRegisterModalOpen(true); };
  const handleCloseWacRegister = useCallback(() => { setSelectedWhatsApp(null); setWacRegisterModalOpen(false); }, []);

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    setConfirmModalInfo(
      action === "disconnect"
        ? { action, title: i18n.t("connections.confirmationModal.disconnectTitle"), message: i18n.t("connections.confirmationModal.disconnectMessage"), whatsAppId }
        : { action, title: i18n.t("connections.confirmationModal.deleteTitle"), message: i18n.t("connections.confirmationModal.deleteMessage"), whatsAppId }
    );
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    try {
      if (confirmModalInfo.action === "disconnect") {
        const wa = whatsApps.find(w => w.id === confirmModalInfo.whatsAppId);
        if (wa?.channel === "instagram") {
          await api.post("/instagram/oauth/disconnect", { whatsappId: confirmModalInfo.whatsAppId });
        } else if (wa?.channel === "whatsapp_cloud") {
          await api.post("/whatsapp-cloud/disconnect", { whatsappId: confirmModalInfo.whatsAppId });
        } else {
          await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
        }
      }
      if (confirmModalInfo.action === "delete") { await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`); toast.success(i18n.t("connections.toasts.deleted")); }
    } catch (err) { toastError(err); }
    setConfirmModalInfo(confirmationModalInitialState);
  };

  const renderSessionButtons = (whatsApp) => {
    const isInstagram = whatsApp.channel === "instagram";
    const isCloud = whatsApp.channel === "whatsapp_cloud";
    const isBaileys = !isInstagram && !isCloud;

    return (
      <div className={classes.sessionBtns}>
        {/* Baileys-specific buttons */}
        {isBaileys && whatsApp.status === "qrcode" && (
          <Button size="small" variant="contained" color="primary" className={classes.smBtn} onClick={() => handleOpenQrModal(whatsApp)}>
            {i18n.t("connections.buttons.qrcode")}
          </Button>
        )}
        {isBaileys && whatsApp.status === "DISCONNECTED" && (
          <>
            <Button size="small" variant="outlined" color="primary" className={classes.smBtn} onClick={() => handleStartWhatsAppSession(whatsApp.id)}>
              {i18n.t("connections.buttons.tryAgain")}
            </Button>
            <Button size="small" variant="outlined" className={classes.smBtn} style={{ borderColor: "#E5E9EF", color: "#9BA3B0" }} onClick={() => handleRequestNewQrCode(whatsApp.id)}>
              {i18n.t("connections.buttons.newQr")}
            </Button>
          </>
        )}

        {/* Instagram-specific buttons */}
        {isInstagram && (whatsApp.status === "WAITING_LOGIN" || whatsApp.status === "DISCONNECTED") && (
          <Button
            size="small"
            variant="contained"
            className={classes.smBtn}
            style={{ background: "linear-gradient(135deg, #f09433, #bc1888)", color: "#fff", border: "none" }}
            onClick={() => handleOpenIgLogin(whatsApp)}
          >
            Conectar Instagram
          </Button>
        )}

        {/* WhatsApp Cloud-specific buttons */}
        {isCloud && (whatsApp.status === "WAITING_LOGIN" || whatsApp.status === "DISCONNECTED") && (
          <Button
            size="small"
            variant="contained"
            className={classes.smBtn}
            style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", color: "#fff", border: "none" }}
            onClick={() => handleOpenWacConnect(whatsApp)}
          >
            Configurar
          </Button>
        )}
        {isCloud && whatsApp.status !== "WAITING_LOGIN" && whatsApp.status !== "OPENING" && (
          <Button
            size="small"
            variant="outlined"
            className={classes.smBtn}
            style={{ borderColor: "#F97316", color: "#F97316" }}
            onClick={() => handleOpenWacRegister(whatsApp)}
          >
            Registrar número
          </Button>
        )}

        {/* Shared buttons */}
        {(whatsApp.status === "CONNECTED" || whatsApp.status === "PAIRING" || whatsApp.status === "TIMEOUT") && (
          <Button size="small" variant="outlined" className={classes.smBtn} style={{ borderColor: "#FECACA", color: "#DC2626" }}
            onClick={() => handleOpenConfirmationModal("disconnect", whatsApp.id)}>
            {i18n.t("connections.buttons.disconnect")}
          </Button>
        )}
        {whatsApp.status === "OPENING" && (
          <Button size="small" variant="outlined" disabled className={classes.smBtn}>
            {i18n.t("connections.buttons.connecting")}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal title={confirmModalInfo.title} open={confirmModalOpen} onClose={setConfirmModalOpen} onConfirm={handleSubmitConfirmationModal}>
        {confirmModalInfo.message}
      </ConfirmationModal>
      <QrcodeModal open={qrModalOpen} onClose={handleCloseQrModal} whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id} />
      <WhatsAppModal open={whatsAppModalOpen} onClose={handleCloseWhatsAppModal} whatsAppId={!qrModalOpen && selectedWhatsApp?.id} />
      <InstagramLoginModal open={igLoginModalOpen} onClose={handleCloseIgLogin} whatsAppId={selectedWhatsApp?.id} />
      <WhatsAppCloudConnectModal open={wacConnectModalOpen} onClose={handleCloseWacConnect} whatsAppId={selectedWhatsApp?.id} />
      <WhatsAppCloudRegisterModal open={wacRegisterModalOpen} onClose={handleCloseWacRegister} whatsAppId={selectedWhatsApp?.id} />

      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>{i18n.t("connections.title")}</h1>
        <Button variant="contained" disableElevation className={classes.addBtn} startIcon={<AddCircleOutline size={18} />} onClick={handleOpenWhatsAppModal}>
          {i18n.t("connections.buttons.add")}
        </Button>
      </div>

      {loading ? (
        <div className={classes.grid}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={classes.card} style={{ minHeight: 160, opacity: 0.5 }} />
          ))}
        </div>
      ) : whatsApps?.length === 0 ? (
        <div className={classes.emptyState}>
          <div className={classes.emptyIcon}><WifiOff size={32} /></div>
          <h2 className={classes.emptyTitle}>Nenhuma conexão</h2>
          <p className={classes.emptyText}>Adicione uma conta WhatsApp para começar a receber e enviar mensagens.</p>
          <Button variant="contained" disableElevation className={classes.addBtn} onClick={handleOpenWhatsAppModal}>
            {i18n.t("connections.buttons.add")}
          </Button>
        </div>
      ) : (
        <div className={classes.grid}>
          {whatsApps.map((whatsApp) => (
            <div key={whatsApp.id} className={classes.card}>
              <div className={classes.cardTop}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className={classes.cardName}>{whatsApp.name}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                    <span className={`${classes.channelBadge} ${
                      whatsApp.channel === "instagram"
                        ? classes.channelBadgeInstagram
                        : whatsApp.channel === "whatsapp_cloud"
                        ? classes.channelBadgeCloud
                        : classes.channelBadgeWhatsapp
                    }`}>
                      {whatsApp.channel === "instagram"
                        ? "📸 Instagram"
                        : whatsApp.channel === "whatsapp_cloud"
                        ? "☁️ WA Cloud"
                        : "📱 WhatsApp"}
                    </span>
                    {whatsApp.isDefault && whatsApp.channel !== "instagram" && (
                      <span className={classes.defaultBadge}>
                        <CheckCircle size={11} /> Padrão
                      </span>
                    )}
                  </div>
                </div>
                <StatusPill whatsApp={whatsApp} classes={classes} />
              </div>

              {whatsApp.queues?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {whatsApp.queues.map((q) => (
                    <Chip
                      key={q.id}
                      label={q.name}
                      size="small"
                      style={{
                        backgroundColor: q.color || "#E5E9EF",
                        color: "#ffffff",
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                        fontWeight: 600,
                        fontSize: 11,
                        height: 22,
                        borderRadius: 6,
                      }}
                    />
                  ))}
                </div>
              )}

              <div className={classes.cardActions}>
                {renderSessionButtons(whatsApp)}
                <div className={classes.iconActions}>
                  <p className={classes.cardMeta} style={{ alignSelf: "center", marginRight: 8 }}>
                    {format(parseISO(whatsApp.updatedAt), "dd/MM HH:mm")}
                  </p>
                  <Tooltip title="Editar">
                    <IconButton size="small" className={classes.iconBtn} onClick={() => handleEditWhatsApp(whatsApp)}>
                      <Edit size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton size="small" className={classes.deleteBtn} onClick={() => handleOpenConfirmationModal("delete", whatsApp.id)}>
                      <DeleteOutline size={18} />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Connections;
