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
import CategoryModal from "../../components/CategoryModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";
import ProfileModal from "../../components/ProfileModal";

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
  if (action.type === "LOAD_PROFILE") {
    const categories = action.payload;
    const newCategory = [];

    categories.forEach((category) => {
      const categoryIndex = state.findIndex((q) => q.id === category.id);
      if (categoryIndex !== -1) {
        state[categoryIndex] = category;
      } else {
        newCategory.push(category);
      }
    });

    return [...state, ...newCategory];
  }

  if (action.type === "UPDATE_PROFILE") {
    const category = action.payload;
    const categoryIndex = state.findIndex((u) => u.id === category.id);

    if (categoryIndex !== -1) {
      state[categoryIndex] = category;
      return [...state];
    } else {
      return [category, ...state];
    }
  }

  if (action.type === "DELETE_PROFILE") {
    const categoryId = action.payload;
    const categoryIndex = state.findIndex((q) => q.id === categoryId);
    if (categoryIndex !== -1) {
      state.splice(categoryIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Profiles = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [profiles, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchProfiles = async () => {
      try {
        const { data } = await api.get("/profile/");
        dispatch({ type: "LOAD_PROFILE", payload: data.profiles });
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    const socket = openSocket();

    socket.on(`profile${user.companyId}`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_PROFILE", payload: data.profile });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_PROFILE", payload: +data.profileId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleOpenProfileModal = () => {
    setProfileModalOpen(true);
    setSelectedProfile(null);
  };

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
    setSelectedProfile(null);
  };

  const handleEditProfile = (profile) => {
    setSelectedProfile(profile);
    setProfileModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedProfile(null);
  };

  const handleDeleteProfile = async (profileId) => {
    try {
      await api.delete(`/profile/${profileId}`);
      toast.success("Perfil deletado com sucesso!");
    } catch (err) {
      toastError(err);
    }
    setDeletingProfile(null);
  };

  return (
    <MainContainer>
      <ProfileModal
        open={profileModalOpen}
        onClose={handleCloseProfileModal}
        aria-labelledby="form-dialog-title"
        profileId={selectedProfile && selectedProfile.id}
      />
      <ConfirmationModal
        title={"Deletar Perfil"}
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteProfile(deletingProfile.id)}
      >
        {
          "Você tem certeza que deseja deletar este perfil? Está ação não poderá ser desfeita."
        }
      </ConfirmationModal>
      <MainHeader>
        <Title>Profiles</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenProfileModal}
          >
            Criar Perfil
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{"Nome"}</TableCell>
              {/* <TableCell align="center">{"Permissões"}</TableCell>
              <TableCell align="center">{"Menus"}</TableCell> */}
              <TableCell align="center">{"Criado em"}</TableCell>
              <TableCell align="center">{"Ações"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {profiles &&
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell align="center">{profile.name}</TableCell>
                    {/* <TableCell align="center">
                      {"profile.permissions"}
                    </TableCell>
                    <TableCell align="center">{"profile.menus"}</TableCell> */}
                    <TableCell align="center">
                      {format(parseISO(profile.createdAt), "dd/MM/yy HH:mm")}
                    </TableCell>
                    <TableCell align="center">
                      {profile.companyId && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleEditProfile(profile)}
                          >
                            <Edit />
                          </IconButton>

                          <IconButton
                            size="small"
                            onClick={() => {
                              setDeletingProfile(profile);
                              setConfirmModalOpen(true);
                            }}
                          >
                            <DeleteOutline />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              {loading && <TableRowSkeleton columns={3} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Profiles;
