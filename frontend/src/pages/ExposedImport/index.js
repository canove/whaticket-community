import React, { useContext, useEffect, useReducer, useState } from "react";
import openSocket from "../../services/socket-io";
import openWorkerSocket from "../../services/socket-worker-io";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { IconButton, TableCell } from "@material-ui/core";
import { Visibility } from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ExposedImportModal from "../../components/ExposedImportModal";

import { useTranslation } from "react-i18next";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { toast } from "react-toastify";
import EditIcon from "@material-ui/icons/Edit";
import ConfirmationModal from "../../components/ConfirmationModal";
import { DeleteOutline } from "@material-ui/icons";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { format, parseISO } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";
import DeleteIcon from '@material-ui/icons/Delete';
import RegisterFileModal from "../../components/RegisterFileModal";

const reducer = (state, action) => {
    if (action.type === "LOAD_EXPOSED_IMPORTS") {
        const exposedImports = action.payload;
        const newExposedImport = [];

        exposedImports.forEach((exposedImport) => {
            const exposedImportIndex = state.findIndex((e) => e.id === exposedImport.id);
            if (exposedImportIndex !== -1) {
                state[exposedImportIndex] = exposedImport;
            } else {
                newExposedImport.push(exposedImport);
            }
        });

        return [...state, ...newExposedImport];
    }

    if (action.type === "UPDATE_EXPOSED_IMPORT") {
        const exposedImport = action.payload;
        const exposedImportIndex = state.findIndex((e) => e.id === exposedImport.id);

        if (exposedImportIndex !== -1) {
            state[exposedImportIndex] = exposedImport;
            return [...state];
        } else {
            return [exposedImport, ...state];
        }
    }

    if (action.type === "DELETE_EXPOSED_IMPORT") {
        const exposedImportId = action.payload;

        const exposedImportIndex = state.findIndex((e) => e.id === exposedImportId);
        if (exposedImportIndex !== -1) {
            state.splice(exposedImportIndex, 1);
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

const ExposedImport = () => {
    const classes = useStyles();
    const { i18n } = useTranslation();
    const { user } = useContext(AuthContext)

    const [exposedImports, dispatch] = useReducer(reducer, []);

    const [loading, setLoading] = useState(false);
    const [selectedExposedImport, setSelectedExposedImport] = useState(null);
    const [deletingExposedImport, setDeletingExposedImport] = useState(null);
    const [exposedImportModalOpen, setExposedImportModalOpen] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

    useEffect(() => {
        dispatch({ type: "RESET" });
    }, []);

    useEffect(() => {
        const fetchImports = async () => {
            setLoading(true);
            try {
                const { data } = await api.get("/exposedImports/");
                dispatch({ type: "LOAD_EXPOSED_IMPORTS", payload: data });
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        }

        fetchImports();
    }, []);

    useEffect(() => {
        const socket = openSocket();

        socket.on(`exposedImport${user.companyId}`, (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_EXPOSED_IMPORT", payload: data.exposedImport });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_EXPOSED_IMPORT", payload: data.exposedImportId });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const socket = openWorkerSocket();

        socket.on(`exposedImport${user.companyId}`, (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_EXPOSED_IMPORT", payload: data.exposedImport });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_EXPOSED_IMPORT", payload: + data.exposedImportId });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleDeleteExposedImport = async () => {
        try {
            await api.delete(`/exposedImports/${deletingExposedImport.id}`);
            toast.success("Importação deletada com sucesso!");
        } catch (err) {
            toastError(err);
        }
        setDeletingExposedImport(null);
    }

    const handleOpenExposedImportModal = () => {
        setSelectedExposedImport(null);
        setExposedImportModalOpen(true);
    }

    const handleEditExposedImportModal = (exposedImport) => {
        setSelectedExposedImport(exposedImport);
        setExposedImportModalOpen(true);
    };

    const handleCloseExposedImportModal = () => {
        setSelectedExposedImport(null);
        setExposedImportModalOpen(false);
    };

    return (
        <MainContainer>
            <ExposedImportModal
                open={exposedImportModalOpen}
                onClose={handleCloseExposedImportModal}
                exposedImportId={selectedExposedImport && selectedExposedImport.id}
            />
            <ConfirmationModal
                title="Deletar Importação"
                open={confirmationModalOpen}
                onClose={setConfirmationModalOpen}
                onConfirm={handleDeleteExposedImport}
            >
                Você tem certeza que realmente deseja deletar esta importação?
            </ConfirmationModal>
            <MainHeader>
                <Title>Importação Exposta</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        onClick={handleOpenExposedImportModal}
                        variant="contained"
                        color="primary"
                    >
                        Criar Importação
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
                            <TableCell align="center">Nome</TableCell>
                            {/* <TableCell align="center">URL</TableCell> */}
                            {/* <TableCell align="center">Mapping</TableCell> */}
                            <TableCell align="center">Updated At</TableCell>
                            <TableCell align="center">Created At</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { exposedImports && exposedImports.map(exposedImport => (
                            <TableRow key={exposedImport.id}>
                                <TableCell align="center">{exposedImport.name}</TableCell>
                                {/* <TableCell align="center">URL</TableCell> */}
                                {/* <TableCell align="center">Mapping</TableCell> */}
                                <TableCell align="center">{format(parseISO(exposedImport.updatedAt), "dd/MM/yyyy HH:mm")}</TableCell>
                                <TableCell align="center">{format(parseISO(exposedImport.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleEditExposedImportModal(exposedImport)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setDeletingExposedImport(exposedImport);
                                            setConfirmationModalOpen(true);
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        )) }
                        {loading && <TableRowSkeleton columns={4} />}
                    </TableBody>
                </Table>
        </Paper>
    </MainContainer>
  );
};

export default ExposedImport;
