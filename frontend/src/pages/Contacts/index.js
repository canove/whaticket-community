import React, { useState, useEffect, useReducer, useContext } from "react";
import openSocket from "../../services/socket-io";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import makeStyles from '@mui/styles/makeStyles';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

import { Search as SearchIcon, Trash2 as DeleteOutlineIcon, Pencil as EditIcon, MessageSquareText as WhatsAppIcon, UserPlus as PersonAddOutlinedIcon, Phone as ContactPhoneOutlinedIcon, Download as GetAppOutlinedIcon } from "lucide-react";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";

import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];
    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });
    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);
    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getAvatarColor = (name = "") => {
  const colors = [
    { bg: "#EEF9F3", text: "#1DAB57" },
    { bg: "#EEF2FF", text: "#4F46E5" },
    { bg: "#FFF7ED", text: "#EA580C" },
    { bg: "#FDF2F8", text: "#DB2777" },
    { bg: "#F0F9FF", text: "#0284C7" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
};

const useStyles = makeStyles(() => ({
  root: {
    padding: "28px 24px",
    backgroundColor: "#F7F8FA",
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
  },

  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 16,
  },

  titleArea: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  titleIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    background: "linear-gradient(135deg, #25D366, #1DAB57)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 20,
      color: "#ffffff",
    },
  },

  titleText: {
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 22,
    color: "#0A0F1E",
    letterSpacing: "-0.4px",
    margin: 0,
  },

  actionsArea: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  searchField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 11,
      backgroundColor: "#ffffff",
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 14,
      height: 40,
      "& fieldset": {
        borderColor: "#E5E9EF",
      },
      "&:hover fieldset": {
        borderColor: "#25D366",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#25D366",
      },
    },
    "& input": {
      padding: "0 14px",
      height: 40,
      boxSizing: "border-box",
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 14,
      color: "#0A0F1E",
    },
  },

  importBtn: {
    height: 40,
    borderRadius: 11,
    border: "1px solid #E5E9EF",
    backgroundColor: "#ffffff",
    color: "#9BA3B0",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#F7F8FA",
      boxShadow: "none",
    },
  },

  addBtn: {
    height: 40,
    borderRadius: 11,
    background: "linear-gradient(135deg, #25D366, #1DAB57)",
    color: "#ffffff",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",
    boxShadow: "none",
    gap: 6,
    "&:hover": {
      background: "linear-gradient(135deg, #1DAB57, #178A45)",
      boxShadow: "none",
    },
  },

  tableCard: {
    borderRadius: 14,
    border: "1px solid #E5E9EF",
    overflow: "hidden",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  tableWrapper: {
    overflowY: "auto",
    flex: 1,
  },

  tableHead: {
    backgroundColor: "#F7F8FA",
  },

  th: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 11,
    color: "#9BA3B0",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    padding: "10px 20px",
    borderBottom: "1px solid #E5E9EF",
    whiteSpace: "nowrap",
  },

  row: {
    borderBottom: "1px solid #F0F2F5",
    transition: "background 0.15s",
    "&:last-child": {
      borderBottom: "none",
    },
    "&:hover": {
      backgroundColor: "rgba(37,211,102,0.04)",
    },
  },

  td: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
    color: "#0A0F1E",
    padding: "10px 20px",
    borderBottom: "none",
    verticalAlign: "middle",
  },

  contactName: {
    fontWeight: 600,
    color: "#0A0F1E",
  },

  contactNumber: {
    color: "#9BA3B0",
    fontSize: 13,
  },

  avatar: {
    width: 34,
    height: 34,
    fontSize: 12,
    fontWeight: 700,
    fontFamily: '"DM Sans", system-ui, sans-serif',
  },

  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  whatsappBtn: {
    color: "#9BA3B0",
    "&:hover": {
      color: "#25D366",
      backgroundColor: "rgba(37,211,102,0.08)",
    },
  },

  editBtn: {
    color: "#9BA3B0",
    "&:hover": {
      color: "#25D366",
      backgroundColor: "rgba(37,211,102,0.08)",
    },
  },

  deleteBtn: {
    color: "#9BA3B0",
    "&:hover": {
      color: "#DC2626",
      backgroundColor: "rgba(220,38,38,0.08)",
    },
  },

  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: 52,
    color: "#C4CDD5",
    marginBottom: 12,
  },

  emptyText: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
    color: "#9BA3B0",
    margin: 0,
  },
}));

const Contacts = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = openSocket();
    socket.emit("joinNotification");
    socket.on("contact", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });
    return () => { socket.disconnect(); };
  }, []);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleSaveTicket = async (contactId) => {
    if (!contactId) return;
    setLoading(true);
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId,
        userId: user?.id,
        status: "open",
      });
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import");
      window.location.reload();
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <div className={classes.root}>
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      />
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${deletingContact.name}?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={() =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : handleimportContact()
        }
      >
        {deletingContact
          ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>

      <div className={classes.pageHeader}>
        <div className={classes.titleArea}>
          <div className={classes.titleIcon}>
            <ContactPhoneOutlinedIcon size={20} />
          </div>
          <p className={classes.titleText}>{i18n.t("contacts.title")}</p>
        </div>
        <div className={classes.actionsArea}>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            variant="outlined"
            size="small"
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={18} style={{ color: "#9BA3B0" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            className={classes.importBtn}
            startIcon={<GetAppOutlinedIcon size={16} />}
            onClick={() => {
              setDeletingContact(null);
              setConfirmOpen(true);
            }}
          >
            {i18n.t("contacts.buttons.import")}
          </Button>
          <Button
            variant="contained"
            className={classes.addBtn}
            startIcon={<PersonAddOutlinedIcon size={16} />}
            onClick={handleOpenContactModal}
          >
            {i18n.t("contacts.buttons.add")}
          </Button>
        </div>
      </div>

      <Paper className={classes.tableCard} elevation={0}>
        <div className={classes.tableWrapper} onScroll={handleScroll}>
          <Table size="small" stickyHeader>
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell className={classes.th} style={{ width: 52 }} />
                <TableCell className={classes.th}>{i18n.t("contacts.table.name")}</TableCell>
                <TableCell className={classes.th}>{i18n.t("contacts.table.whatsapp")}</TableCell>
                <TableCell className={classes.th}>{i18n.t("contacts.table.email")}</TableCell>
                <TableCell className={classes.th} align="right">{i18n.t("contacts.table.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact) => {
                const avatarColors = getAvatarColor(contact.name);
                return (
                  <TableRow key={contact.id} className={classes.row}>
                    <TableCell className={classes.td} style={{ paddingRight: 0, width: 52 }}>
                      <Avatar
                        src={contact.profilePicUrl}
                        className={classes.avatar}
                        style={
                          contact.profilePicUrl
                            ? {}
                            : { backgroundColor: avatarColors.bg, color: avatarColors.text }
                        }
                      >
                        {!contact.profilePicUrl && getInitials(contact.name)}
                      </Avatar>
                    </TableCell>
                    <TableCell className={classes.td}>
                      <span className={classes.contactName}>{contact.name}</span>
                    </TableCell>
                    <TableCell className={classes.td}>
                      <span className={classes.contactNumber}>{contact.number}</span>
                    </TableCell>
                    <TableCell className={classes.td}>
                      <span style={{ color: "#9BA3B0", fontSize: 13 }}>{contact.email}</span>
                    </TableCell>
                    <TableCell className={classes.td} align="right">
                      <IconButton
                        size="small"
                        className={classes.whatsappBtn}
                        title="Iniciar conversa"
                        onClick={() => handleSaveTicket(contact.id)}
                      >
                        <WhatsAppIcon size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        className={classes.editBtn}
                        title="Editar contato"
                        onClick={() => hadleEditContact(contact.id)}
                      >
                        <EditIcon size={18} />
                      </IconButton>
                      <Can
                        role={user.profile}
                        perform="contacts-page:deleteContact"
                        yes={() => (
                          <IconButton
                            size="small"
                            className={classes.deleteBtn}
                            title="Deletar contato"
                            onClick={() => {
                              setConfirmOpen(true);
                              setDeletingContact(contact);
                            }}
                          >
                            <DeleteOutlineIcon size={18} />
                          </IconButton>
                        )}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {loading && <TableRowSkeleton avatar columns={3} />}
              {!loading && contacts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} style={{ border: "none" }}>
                    <div className={classes.emptyState}>
                      <ContactPhoneOutlinedIcon size={52} className={classes.emptyIcon} />
                      <p className={classes.emptyText}>Nenhum contato encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Paper>
    </div>
  );
};

export default Contacts;
