import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { format, isSameDay, parseISO, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import makeStyles from '@mui/styles/makeStyles';
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

import { Search as SearchIcon, TrendingUp as TrendingUpIcon, Filter as FilterListIcon, StickyNote as NoteIcon, FileText as NoteOutlinedIcon, RefreshCw as AutorenewIcon, AlertTriangle as WarningIcon } from "lucide-react";
import Typography from "@mui/material/Typography";
import Markdown from "markdown-to-jsx";

import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import toastError from "../../errors/toastError";
import TicketsQueueSelect from "../../components/TicketsQueueSelect";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getTimeSinceUpdate = (updatedAt) => {
  if (!updatedAt) return null;
  try {
    return formatDistanceToNow(parseISO(updatedAt), { locale: ptBR, addSuffix: true });
  } catch {
    return null;
  }
};

const getUrgencyColor = (updatedAt, status) => {
  if (status === "closed") return "#6366F1";
  if (!updatedAt) return "#25D366";
  const hours = (Date.now() - new Date(updatedAt).getTime()) / 3600000;
  if (hours < 1) return "#25D366";
  if (hours < 4) return "#F59E0B";
  return "#DC2626";
};

const getAvgHours = (tickets) => {
  if (!tickets.length) return null;
  const total = tickets.reduce((acc, t) => {
    const h = (Date.now() - new Date(t.updatedAt).getTime()) / 3600000;
    return acc + h;
  }, 0);
  const avg = total / tickets.length;
  if (avg < 1) return `${Math.round(avg * 60)}min`;
  if (avg < 24) return `${avg.toFixed(1)}h`;
  return `${(avg / 24).toFixed(1)}d`;
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#F7F8FA",
    overflow: "hidden",
  },

  // ── Header ──
  header: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #E5E9EF",
    flexShrink: 0,
  },

  headerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px",
    gap: 16,
    flexWrap: "wrap",
  },

  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  titleIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "linear-gradient(135deg, #25D366, #1DAB57)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": { color: "#fff", fontSize: 18 },
  },

  titleText: {
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 20,
    color: "#0A0F1E",
    letterSpacing: "-0.4px",
    margin: 0,
  },

  titleSub: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12,
    color: "#9BA3B0",
    margin: 0,
  },

  headerControls: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  searchField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
      height: 36,
      backgroundColor: "#F7F8FA",
      "& fieldset": { borderColor: "#E5E9EF" },
      "&:hover fieldset": { borderColor: "#9BA3B0" },
      "&.Mui-focused fieldset": { borderColor: "#25D366" },
    },
    "& .MuiOutlinedInput-input": {
      padding: "7px 12px 7px 0",
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 13,
    },
    width: 200,
  },

  userSelect: {
    height: 36,
    borderRadius: 10,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 13,
    backgroundColor: "#F7F8FA",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E9EF" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9BA3B0" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#25D366" },
    minWidth: 150,
  },

  // ── Metrics bar ──
  metricsBar: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    padding: "0 24px",
    borderTop: "1px solid #F0F2F5",
    overflowX: "auto",
    "&::-webkit-scrollbar": { height: 0 },
  },

  metricPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 20px",
    borderRight: "1px solid #F0F2F5",
    "&:last-child": { borderRight: "none" },
    whiteSpace: "nowrap",
  },

  metricDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },

  metricLabel: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 11,
    fontWeight: 600,
    color: "#9BA3B0",
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },

  metricValue: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 15,
    fontWeight: 700,
    color: "#0A0F1E",
  },

  conversionArrow: {
    fontSize: 14,
    color: "#9BA3B0",
    margin: "0 4px",
  },

  // ── Board ──
  board: {
    display: "flex",
    flex: 1,
    gap: 16,
    padding: "16px 20px 20px",
    overflowX: "auto",
    overflowY: "hidden",
    "&::-webkit-scrollbar": { height: 6 },
    "&::-webkit-scrollbar-thumb": { backgroundColor: "#E5E9EF", borderRadius: 3 },
  },

  // ── Column ──
  column: {
    display: "flex",
    flexDirection: "column",
    minWidth: 300,
    flex: "1 1 300px",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    border: "1px solid #E5E9EF",
    overflow: "hidden",
  },
  columnDragOver: {
    outline: "2px dashed #25D366",
    outlineOffset: -2,
    backgroundColor: "rgba(37,211,102,0.03)",
  },
  columnTopBar: {
    height: 4,
    borderRadius: "14px 14px 0 0",
  },
  columnHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px 10px",
    borderBottom: "1px solid #E5E9EF",
    flexShrink: 0,
  },
  columnHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  columnDot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    flexShrink: 0,
  },
  columnTitle: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 13,
    color: "#0A0F1E",
  },
  columnMeta: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  columnCount: {
    background: "#F7F8FA",
    border: "1px solid #E5E9EF",
    borderRadius: 20,
    padding: "1px 8px",
    fontSize: 11,
    fontWeight: 700,
    color: "#9BA3B0",
    fontFamily: '"DM Sans", system-ui, sans-serif',
  },
  columnAvg: {
    fontSize: 11,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    color: "#9BA3B0",
    fontWeight: 500,
  },
  columnBody: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    "&::-webkit-scrollbar": { width: 4 },
    "&::-webkit-scrollbar-thumb": { backgroundColor: "#E5E9EF", borderRadius: 2 },
  },
  columnLoading: {
    display: "flex",
    justifyContent: "center",
    padding: "24px 0",
  },
  columnEmpty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    color: "#9BA3B0",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 13,
    gap: 6,
  },
  emptyIcon: {
    fontSize: 28,
    color: "#E5E9EF",
  },

  // ── Card ──
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #E5E9EF",
    borderRadius: 10,
    padding: "10px 12px 10px 14px",
    cursor: "grab",
    transition: "box-shadow 0.15s ease, transform 0.1s ease",
    userSelect: "none",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      transform: "translateY(-1px)",
    },
    "&:active": { cursor: "grabbing" },
  },
  cardDragging: {
    opacity: 0.45,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
  cardUrgencyBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: "10px 0 0 10px",
  },
  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 6,
  },
  cardAvatar: {
    width: 34,
    height: 34,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 700,
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    marginBottom: 2,
  },
  cardName: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 13,
    color: "#0A0F1E",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
  },
  cardTime: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 10,
    color: "#9BA3B0",
    flexShrink: 0,
  },
  cardPhone: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 11,
    color: "#9BA3B0",
    marginBottom: 3,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardLastMsg: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12,
    color: "#9BA3B0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.4,
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 6,
  },
  cardFooterLeft: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  queueChip: {
    height: 18,
    fontSize: 10,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    borderRadius: 5,
    "& .MuiChip-label": { paddingLeft: 5, paddingRight: 5 },
  },
  connectionChip: {
    height: 18,
    fontSize: 10,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    borderRadius: 5,
    backgroundColor: "#EFF6FF",
    color: "#3B82F6",
    "& .MuiChip-label": { paddingLeft: 5, paddingRight: 5 },
  },
  cardElapsed: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 10,
    color: "#9BA3B0",
    flexShrink: 0,
  },
  cardTicketId: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 10,
    color: "#C5CAD3",
    fontWeight: 500,
  },
  assigneeRow: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    paddingTop: 6,
    borderTop: "1px solid #F0F2F5",
  },
  assigneeAvatar: {
    width: 18,
    height: 18,
    fontSize: 8,
    fontWeight: 700,
    backgroundColor: "#EEF9F3",
    color: "#1DAB57",
  },
  assigneeName: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 11,
    color: "#9BA3B0",
  },
  unreadBadge: {
    "& .MuiBadge-badge": {
      backgroundColor: "#25D366",
      color: "#fff",
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontWeight: 700,
      fontSize: 9,
      minWidth: 16,
      height: 16,
    },
  },

  noteBtn: {
    padding: 4,
    color: "#C4CDD5",
    "&:hover": {
      color: "#6366F1",
      backgroundColor: "rgba(99,102,241,0.08)",
    },
  },
  noteBtnActive: {
    color: "#6366F1",
    "&:hover": {
      color: "#4F46E5",
      backgroundColor: "rgba(99,102,241,0.12)",
    },
  },

  noteModalTitle: {
    padding: "22px 24px 0",
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 17,
    color: "#0A0F1E",
    letterSpacing: "-0.3px",
    marginBottom: 4,
  },

  noteModalSubtitle: {
    padding: "0 24px",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12,
    color: "#9BA3B0",
    marginBottom: 0,
  },

  noteField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 11,
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 14,
      "& fieldset": { borderColor: "#E5E9EF" },
      "&:hover fieldset": { borderColor: "#6366F1" },
      "&.Mui-focused fieldset": { borderColor: "#6366F1", borderWidth: 1.5 },
    },
    "& textarea": {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 14,
      color: "#0A0F1E",
      lineHeight: 1.6,
    },
  },

  noteCancel: {
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

  noteSave: {
    borderRadius: 11,
    background: "linear-gradient(135deg, #6366F1, #4F46E5)",
    color: "#ffffff",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",
    height: 40,
    padding: "0 24px",
    boxShadow: "none",
    "&:hover": {
      background: "linear-gradient(135deg, #4F46E5, #3730A3)",
      boxShadow: "none",
    },
    "&.Mui-disabled": { opacity: 0.7, color: "#ffffff" },
  },

  summaryBtn: {
    padding: 4,
    color: "#C4CDD5",
    "&:hover": {
      color: "#25D366",
      backgroundColor: "rgba(37,211,102,0.08)",
    },
  },

  summaryText: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
    color: "#0A0F1E",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },

  summaryLoading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: "24px 0",
    color: "#9BA3B0",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 13,
  },
}));

// ─── Column config ────────────────────────────────────────────────────────────

const COLUMNS = [
  { status: "pending", label: "Pendentes", color: "#F59E0B", gradient: "linear-gradient(90deg, #F59E0B, #D97706)" },
  { status: "open",    label: "Em Atendimento", color: "#25D366", gradient: "linear-gradient(90deg, #25D366, #1DAB57)" },
  { status: "closed",  label: "Resolvidos", color: "#6366F1", gradient: "linear-gradient(90deg, #6366F1, #4F46E5)" },
];

// ─── Reducer ─────────────────────────────────────────────────────────────────

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_TICKETS": {
      const { status, tickets } = action.payload;
      const existing = state[status] || [];
      const merged = [...existing];
      tickets.forEach(t => {
        const idx = merged.findIndex(x => x.id === t.id);
        if (idx !== -1) merged[idx] = t;
        else merged.push(t);
      });
      return { ...state, [status]: merged };
    }
    case "UPDATE_TICKET": {
      const ticket = action.payload;
      const newState = { ...state };
      let existing = null;
      COLUMNS.forEach(col => {
        if (newState[col.status]) {
          const found = newState[col.status].find(t => t.id === ticket.id);
          if (found) existing = found;
          newState[col.status] = newState[col.status].filter(t => t.id !== ticket.id);
        }
      });
      const merged = existing ? { ...existing, ...ticket } : ticket;
      const col = merged.status;
      newState[col] = [merged, ...(newState[col] || [])];
      return newState;
    }
    case "MOVE_TICKET": {
      const { ticketId, fromStatus, toStatus } = action.payload;
      const newState = { ...state };
      const fullTicket = (newState[fromStatus] || []).find(t => t.id === ticketId);
      newState[fromStatus] = (newState[fromStatus] || []).filter(t => t.id !== ticketId);
      const target = fullTicket ? { ...fullTicket, status: toStatus } : { id: ticketId, status: toStatus };
      newState[toStatus] = [target, ...(newState[toStatus] || [])];
      return newState;
    }
    case "DELETE_TICKET": {
      const ticketId = action.payload;
      const newState = { ...state };
      COLUMNS.forEach(col => {
        if (newState[col.status]) {
          newState[col.status] = newState[col.status].filter(t => t.id !== ticketId);
        }
      });
      return newState;
    }
    case "RESET_UNREAD": {
      const ticketId = action.payload;
      const newState = { ...state };
      COLUMNS.forEach(col => {
        if (newState[col.status]) {
          newState[col.status] = newState[col.status].map(t =>
            t.id === ticketId ? { ...t, unreadMessages: 0 } : t
          );
        }
      });
      return newState;
    }
    case "UPDATE_TICKET_NOTES": {
      const { ticketId, notes } = action.payload;
      const newState = { ...state };
      COLUMNS.forEach(col => {
        if (newState[col.status]) {
          newState[col.status] = newState[col.status].map(t =>
            t.id === ticketId ? { ...t, notes } : t
          );
        }
      });
      return newState;
    }
    default:
      return state;
  }
};

// ─── TicketCard ───────────────────────────────────────────────────────────────

const TicketCard = ({ ticket, onDragStart, classes, usersMap, onOpenNote, onOpenSummary }) => {
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);

  const urgencyColor = getUrgencyColor(ticket.updatedAt, ticket.status);
  const elapsed = getTimeSinceUpdate(ticket.updatedAt);
  const assigneeName = usersMap[ticket.userId] || null;

  const formatTime = date => {
    if (!date) return "";
    try {
      const parsed = parseISO(date);
      return isSameDay(parsed, new Date())
        ? format(parsed, "HH:mm")
        : format(parsed, "dd/MM");
    } catch {
      return "";
    }
  };

  const handleDragStart = e => {
    setDragging(true);
    onDragStart(e, ticket);
  };

  return (
    <div
      className={`${classes.card} ${dragging ? classes.cardDragging : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setDragging(false)}
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      <div
        className={classes.cardUrgencyBar}
        style={{ backgroundColor: urgencyColor }}
      />

      <div className={classes.cardTop}>
        <Badge
          badgeContent={ticket.unreadMessages || 0}
          className={classes.unreadBadge}
          invisible={!ticket.unreadMessages}
        >
          <Avatar
            src={ticket.contact?.profilePicUrl}
            alt={ticket.contact?.name}
            className={classes.cardAvatar}
            style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
          >
            {ticket.contact?.name ? getInitials(ticket.contact.name) : "?"}
          </Avatar>
        </Badge>
        <div className={classes.cardInfo}>
          <div className={classes.cardHeader}>
            <span className={classes.cardName}>{ticket.contact?.name || "—"}</span>
            <span className={classes.cardTime}>{formatTime(ticket.updatedAt)}</span>
          </div>
          {ticket.contact?.number && (
            <div className={classes.cardPhone}>{ticket.contact.number}</div>
          )}
          <div className={classes.cardLastMsg}>
            {ticket.lastMessage || <em style={{ opacity: 0.5 }}>Sem mensagens</em>}
          </div>
        </div>
      </div>

      <div className={classes.cardFooter}>
        <div className={classes.cardFooterLeft}>
          {ticket.queue ? (
            <Chip
              label={ticket.queue.name}
              size="small"
              className={classes.queueChip}
              style={{
                backgroundColor: `${ticket.queue.color}18`,
                color: ticket.queue.color,
              }}
            />
          ) : null}
          {ticket.whatsapp?.name && (
            <Chip
              label={ticket.whatsapp.name}
              size="small"
              className={classes.connectionChip}
            />
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {elapsed && (
            <Tooltip title={`Última atualização ${elapsed}`} placement="top">
              <span
                className={classes.cardElapsed}
                style={{ color: urgencyColor, fontWeight: 600 }}
              >
                {elapsed}
              </span>
            </Tooltip>
          )}
          <span className={classes.cardTicketId}>#{ticket.id}</span>
          <Tooltip title={ticket.notes ? "Ver/editar observação" : "Adicionar observação"} placement="top">
            <IconButton
              size="small"
              className={`${classes.noteBtn} ${ticket.notes ? classes.noteBtnActive : ""}`}
              onClick={e => { e.stopPropagation(); onOpenNote(ticket); }}
            >
              {ticket.notes
                ? <NoteIcon size={15} />
                : <NoteOutlinedIcon size={15} />}
            </IconButton>
          </Tooltip>
          {ticket.status === "closed" && (
            <Tooltip title="Resumo por IA" placement="top">
              <IconButton
                size="small"
                className={classes.summaryBtn}
                onClick={e => { e.stopPropagation(); onOpenSummary(ticket); }}
              >
                <AutorenewIcon size={15} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>

      {assigneeName && (
        <div className={classes.assigneeRow}>
          <Avatar className={classes.assigneeAvatar}>
            {getInitials(assigneeName)}
          </Avatar>
          <span className={classes.assigneeName}>{assigneeName}</span>
        </div>
      )}
    </div>
  );
};

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

const KanbanColumn = ({ column, tickets, loading, onDragStart, onDrop, classes, usersMap, onOpenNote, onOpenSummary }) => {
  const [dragOver, setDragOver] = useState(false);
  const avg = getAvgHours(tickets);

  return (
    <div
      className={`${classes.column} ${dragOver ? classes.columnDragOver : ""}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); onDrop(column.status); }}
    >
      <div className={classes.columnTopBar} style={{ background: column.gradient }} />
      <div className={classes.columnHeader}>
        <div className={classes.columnHeaderLeft}>
          <div className={classes.columnDot} style={{ backgroundColor: column.color }} />
          <span className={classes.columnTitle}>{column.label}</span>
        </div>
        <div className={classes.columnMeta}>
          {avg && <span className={classes.columnAvg}>ø {avg}</span>}
          <span className={classes.columnCount}>{tickets.length}</span>
        </div>
      </div>

      <div className={classes.columnBody}>
        {loading ? (
          <div className={classes.columnLoading}>
            <CircularProgress size={22} style={{ color: column.color }} />
          </div>
        ) : tickets.length === 0 ? (
          <div className={classes.columnEmpty}>
            <span style={{ fontSize: 28 }}>○</span>
            <span>Nenhum ticket</span>
          </div>
        ) : (
          tickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onDragStart={onDragStart}
              classes={classes}
              usersMap={usersMap}
              onOpenNote={onOpenNote}
              onOpenSummary={onOpenSummary}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ─── MetricPill ───────────────────────────────────────────────────────────────

const MetricPill = ({ label, value, color, classes }) => (
  <div className={classes.metricPill}>
    <div className={classes.metricDot} style={{ backgroundColor: color }} />
    <span className={classes.metricLabel}>{label}</span>
    <span className={classes.metricValue} style={{ color }}>{value}</span>
  </div>
);

// ─── CRM (main) ───────────────────────────────────────────────────────────────

const CRM = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const userQueueIds = user.queues.map(q => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [loading, setLoading] = useState({ pending: true, open: true, closed: true });
  const [tickets, dispatch] = useReducer(reducer, { pending: [], open: [], closed: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [usersMap, setUsersMap] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [noteModal, setNoteModal] = useState({ open: false, ticket: null });
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [summaryModal, setSummaryModal] = useState({ open: false, ticket: null });
  const [summaryText, setSummaryText] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryCache, setSummaryCache] = useState({});

  const dragRef = useRef({ ticketId: null, fromStatus: null });

  const handleOpenNote = (ticket) => {
    setNoteText(ticket.notes || "");
    setNoteModal({ open: true, ticket });
  };

  const handleCloseNote = () => {
    setNoteModal({ open: false, ticket: null });
    setNoteText("");
  };

  const handleOpenSummary = async (ticket) => {
    if (summaryCache[ticket.id]) {
      setSummaryText(summaryCache[ticket.id]);
      setSummaryModal({ open: true, ticket });
      return;
    }
    setSummaryText("");
    setSummaryModal({ open: true, ticket });
    setSummaryLoading(true);
    try {
      const { data } = await api.get(`/messages/${ticket.id}/summary`);
      setSummaryText(data.summary);
      setSummaryCache(prev => ({ ...prev, [ticket.id]: data.summary }));
    } catch (err) {
      toastError(err);
      setSummaryModal({ open: false, ticket: null });
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleCloseSummary = () => {
    setSummaryModal({ open: false, ticket: null });
    setSummaryText("");
  };

  const handleSaveNote = async () => {
    if (!noteModal.ticket) return;
    setNoteSaving(true);
    try {
      await api.put(`/tickets/${noteModal.ticket.id}`, { notes: noteText });
      dispatch({
        type: "UPDATE_TICKET_NOTES",
        payload: { ticketId: noteModal.ticket.id, notes: noteText },
      });
      handleCloseNote();
    } catch (err) {
      toastError(err);
    } finally {
      setNoteSaving(false);
    }
  };

  // Fetch users list for filter + card display
  useEffect(() => {
    api.get("/users/", { params: { pageNumber: 1 } })
      .then(({ data }) => {
        const map = {};
        (data.users || []).forEach(u => { map[u.id] = u.name; });
        setUsersMap(map);
        setUsersList(data.users || []);
      })
      .catch(() => {});
  }, []);

  // Fetch tickets per column
  useEffect(() => {
    const fetchColumn = async status => {
      try {
        const { data } = await api.get("/tickets", {
          params: { status, showAll: user.profile === "admin" ? "true" : "false", queueIds: JSON.stringify(selectedQueueIds), pageNumber: 1 },
        });
        dispatch({ type: "LOAD_TICKETS", payload: { status, tickets: data.tickets } });
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(prev => ({ ...prev, [status]: false }));
      }
    };

    setLoading({ pending: true, open: true, closed: true });
    COLUMNS.forEach(col => dispatch({ type: "LOAD_TICKETS", payload: { status: col.status, tickets: [] } }));
    COLUMNS.forEach(col => fetchColumn(col.status));
  }, [selectedQueueIds]);

  // Socket listeners
  useEffect(() => {
    const socket = openSocket();
    socket.on("connect", () => {
      COLUMNS.forEach(col => socket.emit("joinTickets", col.status));
    });
    socket.on("ticket", data => {
      if (data.action === "updateUnread") dispatch({ type: "RESET_UNREAD", payload: data.ticketId });
      if (data.action === "update" && data.ticket) dispatch({ type: "UPDATE_TICKET", payload: data.ticket });
      if (data.action === "delete") dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
    });
    socket.on("appMessage", data => {
      if (data.action === "create" && data.ticket) dispatch({ type: "UPDATE_TICKET", payload: data.ticket });
    });
    return () => socket.disconnect();
  }, []);

  // Drag & Drop
  const handleDragStart = (e, ticket) => {
    dragRef.current = { ticketId: ticket.id, fromStatus: ticket.status };
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async toStatus => {
    const { ticketId, fromStatus } = dragRef.current;
    if (!ticketId || fromStatus === toStatus) return;
    dragRef.current = { ticketId: null, fromStatus: null };

    dispatch({ type: "MOVE_TICKET", payload: { ticketId, fromStatus, toStatus } });

    try {
      const { data } = await api.put(`/tickets/${ticketId}`, {
        status: toStatus,
        userId: toStatus === "pending" ? null : user.id,
      });
      dispatch({ type: "UPDATE_TICKET", payload: data });
    } catch (err) {
      toastError(err);
      dispatch({ type: "MOVE_TICKET", payload: { ticketId, fromStatus: toStatus, toStatus: fromStatus } });
    }
  };

  // Filter tickets client-side
  const filteredTickets = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const result = {};
    COLUMNS.forEach(col => {
      let list = tickets[col.status] || [];
      if (term) {
        list = list.filter(t =>
          t.contact?.name?.toLowerCase().includes(term) ||
          t.contact?.number?.includes(term)
        );
      }
      if (selectedUserId !== "all") {
        const uid = Number(selectedUserId);
        list = list.filter(t => t.userId === uid);
      }
      result[col.status] = list;
    });
    return result;
  }, [tickets, searchTerm, selectedUserId]);

  // Metrics
  const totalPending = (tickets.pending || []).length;
  const totalOpen = (tickets.open || []).length;
  const totalClosed = (tickets.closed || []).length;
  const totalAll = totalPending + totalOpen + totalClosed;
  const conversionRate = totalAll > 0 ? Math.round((totalClosed / totalAll) * 100) : 0;

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.headerTop}>
          <div className={classes.headerTitle}>
            <div className={classes.titleIcon}>
              <TrendingUpIcon size={18} />
            </div>
            <div>
              <p className={classes.titleText}>Funil de Vendas</p>
              <p className={classes.titleSub}>Gerencie seus atendimentos</p>
            </div>
          </div>
          <div className={classes.headerControls}>
            <TextField
              placeholder="Buscar contato..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={classes.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={16} style={{ color: "#9BA3B0" }} />
                  </InputAdornment>
                ),
              }}
            />
            {usersList.length > 0 && (
              <Select
                variant="outlined"
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                className={classes.userSelect}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon size={14} style={{ color: "#9BA3B0" }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">
                  <em style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontSize: 13 }}>
                    Todos os atendentes
                  </em>
                </MenuItem>
                {usersList.map(u => (
                  <MenuItem key={u.id} value={u.id} style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontSize: 13 }}>
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
            )}
            <TicketsQueueSelect
              selectedQueueIds={selectedQueueIds}
              userQueues={user?.queues}
              onChange={values => setSelectedQueueIds(values)}
            />
          </div>
        </div>

        {/* Metrics bar */}
        <div className={classes.metricsBar}>
          <MetricPill label="Pendentes" value={totalPending} color="#F59E0B" classes={classes} />
          <MetricPill label="Em atendimento" value={totalOpen} color="#25D366" classes={classes} />
          <MetricPill label="Resolvidos" value={totalClosed} color="#6366F1" classes={classes} />
          <MetricPill label="Conversão" value={`${conversionRate}%`} color="#0A0F1E" classes={classes} />
        </div>
      </div>

      {/* Kanban Board */}
      <div className={classes.board}>
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.status}
            column={col}
            tickets={filteredTickets[col.status] || []}
            loading={loading[col.status]}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            classes={classes}
            usersMap={usersMap}
            onOpenNote={handleOpenNote}
            onOpenSummary={handleOpenSummary}
          />
        ))}
      </div>

      {/* Modal de Resumo por IA */}
      <Dialog
        open={summaryModal.open}
        onClose={handleCloseSummary}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 14,
            border: "1px solid #E5E9EF",
            boxShadow: "0 8px 32px rgba(10,15,30,0.10)",
          },
        }}
      >
        <div className={classes.noteModalTitle} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AutorenewIcon size={20} style={{ color: "#25D366" }} />
          Resumo por IA
        </div>
        {summaryModal.ticket && (
          <div className={classes.noteModalSubtitle}>
            {summaryModal.ticket.contact?.name || `Ticket #${summaryModal.ticket.id}`}
            {" · "}#{summaryModal.ticket.id}
          </div>
        )}
        <DialogContent style={{ padding: "16px 24px 8px" }}>
          {!summaryLoading && (summaryText.includes("Alerta de desentendimento") ||
            /Humor do cliente[^:]*:\s*\*{0,2}\s*(frustrad|irritad|insatisfeit|raivos|nervos|hostil)/i.test(summaryText)) && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 11,
              padding: "10px 14px",
              marginBottom: 14,
            }}>
              <WarningIcon size={20} style={{ color: "#DC2626", flexShrink: 0 }} />
              <span style={{ color: "#DC2626", fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                Possível desentendimento detectado nesta conversa
              </span>
            </div>
          )}
          {summaryLoading ? (
            <div className={classes.summaryLoading}>
              <CircularProgress size={28} style={{ color: "#25D366" }} />
              Analisando a conversa...
            </div>
          ) : (
            <div className={classes.summaryText}>
              <Markdown
                options={{
                  disableParsingRawHTML: true,
                  overrides: {
                    strong: {
                      component: ({ children, ...props }) => (
                        <strong
                          {...props}
                          style={{
                            fontWeight: 700,
                            color: (typeof children === "string" && children.includes("Alerta de desentendimento"))
                              ? "#DC2626"
                              : "#0A0F1E",
                          }}
                        >
                          {children}
                        </strong>
                      ),
                    },
                    p: { props: { style: { margin: "0 0 10px" } } },
                  },
                }}
              >
                {summaryText}
              </Markdown>
            </div>
          )}
        </DialogContent>
        <DialogActions style={{ padding: "12px 24px 20px" }}>
          <Button
            onClick={handleCloseSummary}
            className={classes.noteCancel}
            variant="outlined"
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Observações */}
      <Dialog
        open={noteModal.open}
        onClose={handleCloseNote}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 14,
            border: "1px solid #E5E9EF",
            boxShadow: "0 8px 32px rgba(10,15,30,0.10)",
          },
        }}
      >
        <div className={classes.noteModalTitle}>
          Observações
        </div>
        {noteModal.ticket && (
          <div className={classes.noteModalSubtitle}>
            {noteModal.ticket.contact?.name || `Ticket #${noteModal.ticket.id}`}
            {" · "}#{noteModal.ticket.id}
          </div>
        )}
        <DialogContent style={{ padding: "16px 24px 8px" }}>
          <TextField
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            placeholder="Escreva aqui suas observações sobre este ticket..."
            className={classes.noteField}
          />
        </DialogContent>
        <DialogActions style={{ padding: "12px 24px 20px", gap: 10 }}>
          <Button
            onClick={handleCloseNote}
            disabled={noteSaving}
            className={classes.noteCancel}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveNote}
            disabled={noteSaving}
            className={classes.noteSave}
            variant="contained"
          >
            {noteSaving ? (
              <CircularProgress size={18} style={{ color: "#fff" }} />
            ) : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CRM;
