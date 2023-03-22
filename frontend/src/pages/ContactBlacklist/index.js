import React, { useContext, useEffect, useReducer, useState } from "react";

import openSocket from "../../services/socket-io";

import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACT_BLACKLIST") {
    const blacklist = action.payload;
    const newContactBlacklist = [];

    blacklist.forEach((contactBlacklist) => {
      const contactBlacklistIndex = state.findIndex((q) => q.id === contactBlacklist.id);
      if (contactBlacklistIndex !== -1) {
        state[contactBlacklistIndex] = contactBlacklist;
      } else {
        newContactBlacklist.push(contactBlacklist);
      }
    });

    return [...state, ...newContactBlacklist];
  }

  if (action.type === "UPDATE_CONTACT_BLACKLIST") {
    const contactBlacklist = action.payload;
    const contactBlacklistIndex = state.findIndex((u) => u.id === contactBlacklist.id);

    if (contactBlacklistIndex !== -1) {
      state[contactBlacklistIndex] = contactBlacklist;
      return [...state];
    } else {
      return [contactBlacklist, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT_BLACKLIST") {
    const contactBlacklistId = action.payload;
    const contactBlacklistIndex = state.findIndex((q) => q.id === contactBlacklistId);
    if (contactBlacklistIndex !== -1) {
      state.splice(contactBlacklistIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const ContactBlacklist = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [blacklist, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [deletingContactBlacklist, setDeletingContactBlacklist] = useState(null);
  // const [contactBlacklistModalOpen, setContactBlacklistModalOpen] = useState(false);
  const [selectedContactBlacklist, setSelectedContactBlacklist] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const {user} = useContext(AuthContext)

     useEffect(() => {
        dispatch({ type: "RESET" });
    }, []);

    useEffect(() => {
        setLoading(true); 
        const fetchContactBlacklist = async () => {
            try {
                const { data } = await api.get("/contactBlacklist/");
                dispatch({ type: "LOAD_CONTACT_BLACKLIST", payload: data });
                setLoading(false);
            } catch (err) {
                toastError(err);
                setLoading(false);
            }
        };
        fetchContactBlacklist();
    }, []);

    useEffect(() => {
      const socket = openSocket();

      socket.on(`contactBlacklist${user.companyId}`, (data) => {
        if (data.action === "update" || data.action === "create") {
          dispatch({ type: "UPDATE_CONTACT_BLACKLIST", payload: data.contactBlacklist });
        }

        if (data.action === "delete") {
          dispatch({ type: "DELETE_CONTACT_BLACKLIST", payload: + data.contactBlacklistId });
        }
      });

      return () => {
        socket.disconnect();
      };
    }, []);

  // const handleOpenContactBlacklistModal = () => {
  //   setContactBlacklistModalOpen(true);
  //   setSelectedContactBlacklist(null);
  // };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedContactBlacklist(null);
  };

  const handleDeleteContactBlacklist = async (contactId) => {
    try {
        await api.delete(`/contactBlacklist/${contactId}`);
        toast.success("Número removido da blacklist com sucesso.");
    } catch (err) {
        toastError(err);
    }
    setDeletingContactBlacklist(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={"Remover número da blacklist"}
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteContactBlacklist(deletingContactBlacklist.contactId)}
      >
        {`Você tem certeza que deseja remover o número ${deletingContactBlacklist && deletingContactBlacklist.contact.number} da blacklist?`}
      </ConfirmationModal>
      <MainHeader>
        <Title>{"Blacklist de Contatos"}</Title>
        <MainHeaderButtonsWrapper>
          {/* <Button
            variant="contained"
            color="primary"
            onClick={handleOpenContactBlacklistModal}
          >
            {i18n.t("contactBlacklist.buttons.create")}
          </Button> */}
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{"Número"}</TableCell>
              <TableCell align="center">{"Ações"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {blacklist && blacklist.map((contactBlacklist) => (
                <TableRow key={contactBlacklist.id}>
                  <TableCell align="center">{contactBlacklist.contact.number}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeletingContactBlacklist(contactBlacklist);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default ContactBlacklist;
