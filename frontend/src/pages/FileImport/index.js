import React, { useContext, useEffect, useReducer, useState } from "react";
import openSocket from "../../services/socket-io";
import openWorkerSocket from "../../services/socket-worker-io";
import openSQSSocket from "../../services/socket-sqs-io";

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
import { IconButton, Typography } from "@material-ui/core";
import { Cancel, Pause, PlayArrow, Visibility } from "@material-ui/icons";
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import RegisterFileModal from "../../components/RegisterFileModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ConfirmationModal from "../../components/ConfirmationModal";

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

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [testingFile, setTestingFile] = useState(null);

  const [cancelingFile, setCancelingFile] = useState(null);
  const [cancelingModalOpen, setCancelingModalOpen] = useState(false);

  const { user } = useContext(AuthContext);
  const [users, dispatchUsers] = useReducer(reducer, []);
  const [imports, dispatchImports] = useReducer(reducer, []);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    dispatchUsers({ type: "RESET" });
    dispatchImports({ type: "RESET" });
  }, [pageNumber, status, date]);

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
          setLoading(false);
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
    if (status === `${i18n.t("importation.form.awaitingImport")}`) {
      return "0";
    } else if (status === `${i18n.t("importation.form.processing")}`) {
      return "1";
    } else if (status === `${i18n.t("importation.form.waitingForApproval")}`) {
      return "2";
    } else if (status === `${i18n.t("importation.form.error")}`) {
      return "3";
    } else if (status === `${i18n.t("importation.form.aproved")}`) {
      return "4";
    } else if (status === `${i18n.t("importation.form.shooting")}`) {
      return "5";
    } else if (status === `${i18n.t("importation.form.finished")}`) {
      return "6";
    } else if (status === `${i18n.t("importation.form.refused")}`) {
      return "7";
    } else if (status === `Validando Números`) {
      return "8";
    } else if (status === `Processando Números`) { 
      return "9";
    } else if (status === `Pausado`) {
      return "10";
    } else if (status === `Interrompido`) {
      return "11";
    } else {
      return status;
    }
  };

  const getStatusById = (id) => {
    if (id === 0) {
      return `${i18n.t("importation.form.awaitingImport")}`;
    } else if (id === 1) {
      return `${i18n.t("importation.form.processing")}`;
    } else if (id === 2) {
      return `${i18n.t("importation.form.waitingForApproval")}`;
    } else if (id === 3) {
      return `${i18n.t("importation.form.error")}`;
    } else if (id === 4) {
      return `${i18n.t("importation.form.aproved")}`;
    } else if (id === 5) {
      return `${i18n.t("importation.form.shooting")}`;
    } else if (id === 6) {
      return `${i18n.t("importation.form.finished")}`;
    } else if (id === 7) {
      return `${i18n.t("importation.form.refused")}`;
    } else if (id === 8) {
      return `Validando Números`;
    } else if (id === 9) {
      return `Processando Números`;
    } else if (id === 10) {
      return `Pausado`;
    } else if (id === 11) {
      return `Interrompido`;
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
    setPageNumber(1);
  }, [status, date])

  useEffect(() => {
    handleFilter();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importModalOpen, registerFileModalOpen, status, date, pageNumber]);

  const handleFilter = async () => {
    setLoading(true);
    try {
      setLoading(true);
      const { data } = await api.get(`file/list`, {
        params: {
          status,
          date,
          pageNumber
        }
      });
      dispatchImports({ type: "LOAD_FILES", payload: data.reports });
      setCount(data.count);
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleTestFileWhatsapps = async (fileId) => {
    try {
      await api.put(`/file/testWhatsapps/${fileId}`);
    } catch (err) {
      toastError(err);
    }

    setTestingFile(null);
  }

  useEffect(() => {
    const socket = openSocket();

    socket.on(`file${user.companyId}`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatchImports({ type: "UPDATE_FILES", payload: data.file });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

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
  }, [user]);

  useEffect(() => {
    const socket = openSQSSocket();

    socket.on(`file${user.companyId}`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatchImports({ type: "UPDATE_FILES", payload: data.file });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handlePause = async (fileId) => {
    await updateFile(fileId, 10);
  }

  const handleStart = async (fileId) => {
    await updateFile(fileId, 5);
  }

  const handleCancel = async (fileId) => {
    await updateFile(fileId, 11);
  }

  const updateFile = async (fileId, status) => {
    try {
      await api.put(`/file/update/${fileId}/?status=${status}`);
    } catch (err) {
      toastError(err);
    }
  }

  const getTemplate = (file) => {
    if (file.template) return file.template.name;
    if (file.officialTemplate) return file.officialTemplate.name;

    return "";
  }

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
      <ConfirmationModal
        title={
          testingFile &&
          `Verificar whatsapps do arquivo: ${
            testingFile.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => { handleTestFileWhatsapps(testingFile.id) }}
      >
        Você tem certeza que deseja remover os números que não tem whatsapp desse arquivo? Essa ação não poderá ser desfeita.
      </ConfirmationModal>
      <ConfirmationModal
        title={
          cancelingFile &&
          `Cancelar os disparos do arquivo: ${
            cancelingFile.name
          }?`
        }
        open={cancelingModalOpen}
        onClose={setCancelingModalOpen}
        onConfirm={() => { handleCancel(cancelingFile.id) }}
      >
        Você tem certeza que deseja cancelar os disparos desse arquivo? Essa ação não poderá ser desfeita.
      </ConfirmationModal>
      <MainHeader>
        <Title>{i18n.t("importation.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Autocomplete
            className={classes.root}
            options={[
              `${i18n.t("importation.form.awaitingImport")}`,
              `${i18n.t("importation.form.processing")}`,
              `${i18n.t("importation.form.waitingForApproval")}`,
              `${i18n.t("importation.form.error")}`,
              `${i18n.t("importation.form.aproved")}`,
              `${i18n.t("importation.form.shooting")}`,
              `${i18n.t("importation.form.finished")}`,
              `${i18n.t("importation.form.refused")}`,
              `Validando Números`,
              `Processando Números`,
              `Pausado`,
              `Interrompido`
            ]}
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
                {"Template"}
              </TableCell>
              <TableCell align="center">
                {"Categoria"}
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
              {imports && imports.map((item, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell align="center">
                      {format(parseISO(item.CreatedAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell align="center">{item.name}</TableCell>
                    <TableCell align="center">{getTemplate(item)}</TableCell>
                    <TableCell align="center">
                      {item.connectionFile ? item.connectionFile.name : ""}
                    </TableCell>
                    <TableCell align="center">
                      {getUserById(item.ownerid)}
                    </TableCell>
                    <TableCell align="center">{item.QtdeRegister}</TableCell>
                    <TableCell align="center">
                      {getStatusById(item.status)}
                    </TableCell>
                    <TableCell align="center">
                      {getOfficial(item.official)}
                    </TableCell>
                    <TableCell align="center">
                        {item.status === 2 && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenRegisterFileModal(item.id)}
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setConfirmModalOpen(true);
                                setTestingFile(item);
                              }}
                            >
                              <WhatsAppIcon />
                            </IconButton>
                          </>
                        )}
                        {item.status === 5 && (
                          <IconButton
                            size="small"
                            onClick={() => handlePause(item.id)}
                          >
                            <Pause />
                          </IconButton>
                        )}
                        {item.status === 10 && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleStart(item.id)}
                            >
                              <PlayArrow />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setCancelingFile(item);
                                setCancelingModalOpen(true);
                              }}
                            >
                              <Cancel />
                            </IconButton>
                          </>
                        )}
										</TableCell>
                  </TableRow>
                );
              })}
              {loading && <TableRowSkeleton columns={7} />}
            </>
          </TableBody>
        </Table>
        <div
					style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}
				>
					<Button
						variant="outlined"
						onClick={() => { setPageNumber(prevPageNumber => prevPageNumber - 1) }}
						disabled={ pageNumber === 1}
					>
						{i18n.t("importation.buttons.previousPage")}
					</Button>
					<Typography
						style={{ display: "inline-block", fontSize: "1.25rem" }}
					>
						{ pageNumber } / { Math.ceil(count / 10) }
					</Typography>
					<Button
						variant="outlined"
						onClick={() => { setPageNumber(prevPageNumber => prevPageNumber + 1) }}
						disabled={ !hasMore }
					>
						{i18n.t("importation.buttons.nextPage")}
					</Button>
				</div>
      </Paper>
    </MainContainer>
  );
}

export default FileImport;
