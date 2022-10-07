import React, { useEffect, useReducer, useState } from "react";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { IconButton, TableCell } from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ImportationModal from "../../components/ImportationModal";

import { useTranslation } from "react-i18next";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { toast } from "react-toastify";
import EditIcon from "@material-ui/icons/Edit";
import ConfirmationModal from "../../components/ConfirmationModal";
import { DeleteOutline } from "@material-ui/icons";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { format, parseISO } from "date-fns";


const reducer = (state, action) => {
    if (action.type === "LOAD_IMPORTATION") {
        const importations = action.payload;
        const newImportation = [];

        importations.forEach((importation) => {
            const importationIndex = state.findIndex((p) => p.id === importation.id);
            if (importationIndex !== -1) {
                state[importationIndex] = importation;
            } else {
                newImportation.push(importation);
            }
        });

        return [...state, ...newImportation];
    }

    if (action.type === "UPDATE_IMPORTATION") {
        const importation = action.payload;
        const importationIndex = state.findIndex((p) => p.id === importation.id);

        if (importationIndex !== -1) {
            state[importationIndex] = importation;
            return [...state];
        } else {
            return [importation, ...state];
        }
    }

    if (action.type === "DELETE_IMPORTATION") {
        const integratedImportId = action.payload;

        const importationIndex = state.findIndex((p) => p.id === integratedImportId);
        if (importationIndex !== -1) {
            state.splice(importationIndex, 1);
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
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const IntegratedImport = () => {
    const classes = useStyles();
    const { i18n } = useTranslation();

    const [importations, dispatch] = useReducer(reducer, []);
    const [selectedImportation, setSelectedImportation] = useState(null);
    const [importationModalOpen, setImportationModalOpen] = useState(false);
    const [deletingImportation, setDeletingImportation] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch({ type: "RESET" });
    }, []);

    useEffect(() => {
        setLoading(true);
        const fetchImportation = async () => {
            try {
                const { data } = await api.get("/integratedImport");
                dispatch({ type: "LOAD_IMPORTATION", payload: data });
                setLoading(false);
            } catch (err) {
                toastError(err);
                setLoading(false);
            }
        };
        fetchImportation();
    }, []);

    useEffect(() => {
        const socket = openSocket();

        socket.on("integratedImport", (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_IMPORTATION", payload: data.integratedImport });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_IMPORTATION", payload: + data.integratedImportId });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleOpenImportationModal = () => {
        setSelectedImportation(null);
        setImportationModalOpen(true);
    };

    const handleCloseImportationModal = () => {
        setSelectedImportation(null);
        setImportationModalOpen(false);
    };

    const handleEditImportation = (integratedImport) => {
        setSelectedImportation(integratedImport);
        setImportationModalOpen(true);
    };

    const handleDeleteImportation = async (deletingImportation) => {
        try {
            await api.delete(`/integratedImport/${deletingImportation}`);
            toast.success(i18n.t("Importação excluída com sucesso!"));
        } catch (err) {
            toastError(err);
        }
        setDeletingImportation(null);
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
  }

    return (
        <MainContainer>
            <ImportationModal
                open={importationModalOpen}
                onClose={handleCloseImportationModal}
                aria-labelledby="form-dialog-title"
                integratedImportId={selectedImportation && selectedImportation.id}
            />
            <ConfirmationModal
                title={
                deletingImportation &&
                `Deletar Importação`}
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDeleteImportation(deletingImportation.id)}
            >
                {i18n.t("Todos os dados da importação se perderão, deseja realmente excluir?")}
            </ConfirmationModal>
            <MainHeader>
                <Title>Importação Integrada</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        onClick={handleOpenImportationModal}
                        variant="contained"
                        color="primary"
                    >
                        Criar nova Importação
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Data da Criação</TableCell>
                            <TableCell align="center">Nome</TableCell>
                            <TableCell align="center">Método</TableCell>
                            <TableCell align="center">Qtde de Registros</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {importations && importations.map((importation) => (
                            <TableRow key={importation.id}>
                                <TableCell align="center">{format(parseISO(importation.createdAt), "dd/MM/yy HH:mm" )}</TableCell>
                                <TableCell align="center">{importation.name}</TableCell>
                                <TableCell align="center">{importation.method}</TableCell>
                                <TableCell align="center">{importation.qtdeRegister}</TableCell>
                                <TableCell align="center">{getStatusById(importation.status)}</TableCell>
                                <TableCell align="center">
                                <IconButton
                                    size="small"
                                    onClick={(e) => handleEditImportation(importation)}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                    setDeletingImportation(importation);
                                    setConfirmModalOpen(true);
                                    }}
                                >
                                    <DeleteOutline />
                                </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}

                        {loading && <TableRowSkeleton columns={6} />}
                    </TableBody>
                </Table>
        </Paper>
    </MainContainer>
  );
};

export default IntegratedImport;
