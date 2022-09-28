import React, { useContext, useEffect, useReducer, useState } from "react";
import openSocket from "../../services/socket-io";
import openWorkerSocket from "../../services/socket-worker-io";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import { useTranslation } from "react-i18next";
import ImportModal from "../../components/ImportModal";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { parseISO, format } from "date-fns";
import { IconButton } from "@material-ui/core";
import { Visibility } from "@material-ui/icons";
import RegisterFileModal from "../../components/RegisterFileModal";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "inline-flex",
    width: 200,
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

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

  if (action.type === "LOAD_FILES") {
    const files = action.payload;
    const newFiles = [];

    files.forEach((file) => {
      const fileIndex = state.findIndex((f) => f.id === file.id);
      if (fileIndex !== -1) {
        state[fileIndex] = file;
      } else {
        newFiles.push(file);
      }
    });

    return [...state, ...newFiles];
  }

  if (action.type === "UPDATE_FILES") {
    const file = action.payload;
    const fileIndex = state.findIndex((f) => f.id === file.id);

    if (fileIndex !== -1) {
      state[fileIndex] = file;
      return [...state];
    } else {
      return [file, ...state];
    }
  }
  if (action.type === "RESET") {
    return [];
  }
};

const FileImport = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [registerFileModalOpen, setRegisterFileModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState("");

  const { user } = useContext(AuthContext);
  const [users, dispatchUsers] = useReducer(reducer, []);
  const [imports, dispatchImports] = useReducer(reducer, []);

  useEffect(() => {
    dispatchUsers({ type: "RESET" });
    dispatchImports({ type: "RESET" });
  }, []);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/");
          dispatchUsers({ type: "LOAD_USERS", payload: data.users });
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, []);

  const renderOptionLabel = (option) => {
    return option;
  };

  const handleOpenImportModal = () => {
    setImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setImportModalOpen(false);
  };

  const handleOpenRegisterFileModal = (fileId) => {
    setSelectedFileId(fileId)
    setRegisterFileModalOpen(true);
  };

  const handleCloseRegisterFileModal = () => {
    setRegisterFileModalOpen(false);
  };

  const getStatusByName = (status) => {
    if (status === "Aguardando Importação") {
      return "0";
    } else if (status === "Processando") {
      return "1";
    } else if (status === "Aguardando Aprovação") {
      return "2";
    } else if (status === "Erro") {
      return "3";
    } else if (status === "Aprovado") {
      return "4";
    } else if (status === "Disparando") {
      return "5";
    } else if (status === "Finalizado") {
      return "6";
    } else if (status === "Recusado") {
      return "7";
    } else {
      return status;
    }
  };

  const getStatusById = (id) => {
    if (id === 0) {
      return "Aguardando Importação";
    } else if (id === 1) {
      return "Processando";
    } else if (id === 2) {
      return "Aguardando Aprovação";
    } else if (id === 3) {
      return "Erro";
    } else if (id === 4) {
      return "Aprovado";
    } else if (id === 5) {
      return "Disparando";
    } else if (id === 6) {
      return "Finalizado";
    } else if (id === 7) {
      return "Recusado";
    } else {
      return id;
    }
  };

  const getUserById = (userId) => {
    let response = "";
    users.map((user) => {
      if (user.id === userId) {
        response = user.name;
      }
      return null
    });
    return response;
  };

  const getOfficial = (official) => {
    if (official === null) {
      return "Null"
    }

    if (official) {
      return "Oficial";
    } else {
      return "Não Oficial";
    }
  }

  const handleSelectOption = (e, newValue) => {
    if (newValue === null) {
      setStatus("");
    } else {
      setStatus(getStatusByName(newValue));
    }
  };

  useEffect(() => {
    handleFilter();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importModalOpen, registerFileModalOpen]);

  const handleFilter = async () => {
    setLoading(true);
    try {
      setLoading(true);
      const { data } = await api.get(`file/list?Status=${status}&initialDate=${date}`);
      dispatchImports({ type: "LOAD_FILES", payload: data });
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  // useEffect(() => {
  //   const socket = openSocket();

  //   socket.on(`file${user.companyId}`, (data) => {
  //     if (data.action === "update" || data.action === "create") {
  //       dispatchImports({ type: "UPDATE_FILES", payload: data.file });
  //     }
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    const socket = openWorkerSocket();

    socket.on(`file${user.companyId}`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatchImports({ type: "UPDATE_FILES", payload: data.file });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <MainContainer>
      <ImportModal
        open={importModalOpen}
        onClose={handleCloseImportModal}
        aria-labelledby="form-dialog-title"
      >
      </ImportModal>
      <RegisterFileModal
        open={registerFileModalOpen}
        onClose={handleCloseRegisterFileModal}
        aria-labelledby="form-dialog-title"
        fileId={selectedFileId}
      >
      </RegisterFileModal>
      <MainHeader>
        <Title>{i18n.t("importation.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Autocomplete
            className={classes.root}
            options={["Aguardando Importação", "Processando", "Aguardando Aprovação", "Erro", "Aprovado", "Disparando", "Finalizado", "Recusado"]}
            getOptionLabel={renderOptionLabel}
            onChange={(e, newValue) => handleSelectOption(e, newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={i18n.t("importation.form.status")}
                InputLabelProps={{ required: true }}
              />
            )}
          />
          <TextField
            onChange={(e) => {
              setDate(e.target.value);
            }}
            label={i18n.t("importation.form.date")}
            InputLabelProps={{ shrink: true, required: true }}
            type="date"
          />
          <Button variant="contained" color="primary" onClick={handleFilter}>
            {i18n.t("importation.buttons.filter")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenImportModal}
          >
            {i18n.t("importation.buttons.import")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("importation.table.uploadDate")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("importation.table.fileName")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("importation.table.sentBy")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("importation.table.numberOfRecords")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("importation.table.status")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("importation.table.official")}
              </TableCell>
              <TableCell align="center">
								{i18n.t("importation.table.actions")}
							</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {imports.map((item, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell align="center">
                      {format(parseISO(item.CreatedAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell align="center">{item.name}</TableCell>
                    <TableCell align="center">
                      {getUserById(item.ownerid)}
                    </TableCell>
                    <TableCell align="center">{item.QtdeRegister}</TableCell>
                    <TableCell align="center">
                      {getStatusById(item.Status)}
                    </TableCell>
                    <TableCell align="center">
                      {getOfficial(item.official)}
                    </TableCell>
                    <TableCell align="center">
                        {item.Status === 2 && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenRegisterFileModal(item.id)}
                            >
                              <Visibility />
                            </IconButton>
                          </>
                        )}
										</TableCell>
                  </TableRow>
                );
              })}
              {loading}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
}

export default FileImport;
