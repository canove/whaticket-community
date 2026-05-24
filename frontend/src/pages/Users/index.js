import React, { useState, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import openSocket from "../../services/socket-io";

import makeStyles from '@mui/styles/makeStyles';
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";

import { Search as SearchIcon, Trash2 as DeleteOutlineIcon, Pencil as EditIcon, UserPlus as PersonAddOutlinedIcon, Users as PeopleOutlineIcon } from "lucide-react";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";

const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const users = action.payload;
    const newUsers = [];
    users.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });
    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;
    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

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

  searchField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 11,
      backgroundColor: "#ffffff",
      "& fieldset": { borderColor: "#E5E9EF" },
      "&:hover fieldset": { borderColor: "#9BA3B0" },
      "&.Mui-focused fieldset": { borderColor: "#25D366" },
    },
    "& .MuiOutlinedInput-input": {
      padding: "10px 14px 10px 0",
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 14,
    },
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

  userCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 36,
    height: 36,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: '"DM Sans", system-ui, sans-serif',
  },

  userName: {
    fontWeight: 600,
    color: "#0A0F1E",
  },

  emailText: {
    color: "#9BA3B0",
    fontSize: 13,
  },

  adminChip: {
    height: 22,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    letterSpacing: "0.3px",
    backgroundColor: "rgba(37, 211, 102, 0.12)",
    color: "#1DAB57",
    border: "1px solid rgba(37, 211, 102, 0.25)",
  },

  userChip: {
    height: 22,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    letterSpacing: "0.3px",
    backgroundColor: "#F7F8FA",
    color: "#9BA3B0",
    border: "1px solid #E5E9EF",
  },

  whatsappChip: {
    height: 22,
    fontSize: 11,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    backgroundColor: "#F7F8FA",
    color: "#0A0F1E",
    border: "1px solid #E5E9EF",
    maxWidth: 140,
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

const Users = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [users, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_USERS", payload: data.users });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = openSocket();
    socket.on("user", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_USERS", payload: data.user });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_USER", payload: +data.userId });
      }
    });
    return () => { socket.disconnect(); };
  }, []);

  const handleOpenUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
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
    <MainContainer>
      <ConfirmationModal
        title={
          deletingUser &&
          `${i18n.t("users.confirmationModal.deleteTitle")} ${deletingUser.name}?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteUser(deletingUser.id)}
      >
        {i18n.t("users.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <UserModal
        open={userModalOpen}
        onClose={handleCloseUserModal}
        aria-labelledby="form-dialog-title"
        userId={selectedUser && selectedUser.id}
      />
      <MainHeader>
        <Title>{i18n.t("users.title")}</Title>
        <MainHeaderButtonsWrapper>
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
                  <SearchIcon size={20} style={{ color: "#9BA3B0" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            className={classes.addButton}
            onClick={handleOpenUserModal}
            startIcon={<PersonAddOutlinedIcon size={18} />}
          >
            {i18n.t("users.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <div className={classes.tableScroll} onScroll={handleScroll}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>{i18n.t("users.table.name")}</TableCell>
                <TableCell>{i18n.t("users.table.email")}</TableCell>
                <TableCell>{i18n.t("users.table.profile")}</TableCell>
                <TableCell>{i18n.t("users.table.whatsapp")}</TableCell>
                <TableCell align="right">{i18n.t("users.table.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const avatarColors = getAvatarColor(user.name);
                return (
                  <TableRow key={user.id} className={classes.tableRow}>
                    <TableCell>
                      <div className={classes.userCell}>
                        <Avatar
                          className={classes.avatar}
                          style={{
                            backgroundColor: avatarColors.bg,
                            color: avatarColors.text,
                          }}
                        >
                          {getInitials(user.name)}
                        </Avatar>
                        <span className={classes.userName}>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={classes.emailText}>{user.email}</span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.profile === "admin" ? "Admin" : "User"}
                        size="small"
                        className={user.profile === "admin" ? classes.adminChip : classes.userChip}
                      />
                    </TableCell>
                    <TableCell>
                      {user.whatsapp?.name && (
                        <Chip
                          label={user.whatsapp.name}
                          size="small"
                          className={classes.whatsappChip}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        className={classes.editBtn}
                        onClick={() => handleEditUser(user)}
                      >
                        <EditIcon size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        className={classes.deleteBtn}
                        onClick={() => {
                          setConfirmModalOpen(true);
                          setDeletingUser(user);
                        }}
                      >
                        <DeleteOutlineIcon size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {loading && <TableRowSkeleton columns={5} />}
            </TableBody>
          </Table>

          {!loading && users.length === 0 && (
            <div className={classes.emptyState}>
              <PeopleOutlineIcon size={48} className={classes.emptyIcon} />
              <p className={classes.emptyTitle}>Nenhum usuário encontrado</p>
              <p className={classes.emptyText}>
                {searchParam
                  ? "Tente ajustar sua pesquisa"
                  : "Adicione o primeiro usuário clicando no botão acima"}
              </p>
            </div>
          )}
        </div>
      </Paper>
    </MainContainer>
  );
};

export default Users;
