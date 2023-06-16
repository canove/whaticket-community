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
import PackageModal from "../../components/PackageModal";

import { useTranslation } from "react-i18next";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { toast } from "react-toastify";
import EditIcon from "@material-ui/icons/Edit";
import ConfirmationModal from "../../components/ConfirmationModal";
import { DeleteOutline } from "@material-ui/icons";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import SystemChangeModal from "../../components/SystemChangeModal";
import HistoryIcon from '@material-ui/icons/History';


const reducer = (state, action) => {
    if (action.type === "LOAD_PACKAGES") {
        const packages = action.payload;
        const newPackages = [];

        packages.forEach((pack) => {
            const packageIndex = state.findIndex((p) => p.id === pack.id);
            if (packageIndex !== -1) {
                state[packageIndex] = pack;
            } else {
                newPackages.push(pack);
            }
        });

        return [...state, ...newPackages];
    }

    if (action.type === "UPDATE_PACKAGES") {
        const pack = action.payload;
        const packageIndex = state.findIndex((p) => p.id === pack.id);

        if (packageIndex !== -1) {
            state[packageIndex] = pack;
            return [...state];
        } else {
            return [pack, ...state];
        }
    }

    if (action.type === "DELETE_PACKAGE") {
        const packageId = action.payload;

        const packageIndex = state.findIndex((p) => p.id === packageId);
        if (packageIndex !== -1) {
            state.splice(packageIndex, 1);
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

const Packages = () => {
    const classes = useStyles();
    const { i18n } = useTranslation();

    const [packages, dispatch] = useReducer(reducer, []);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [packageModalOpen, setPackageModalOpen] = useState(false);
    const [deletingPackage, setDeletingPackage] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedHistoric, setSelectedHistoric] = useState(null);
    const [historicModalOpen, setHistoricModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch({ type: "RESET" });
    }, []);

    useEffect(() => {
        setLoading(true);
        const fetchPackages = async () => {
            try {
                const { data } = await api.get("/packages/");
                dispatch({ type: "LOAD_PACKAGES", payload: data });
                setLoading(false);
            } catch (err) {
                toastError(err);
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    useEffect(() => {
        const socket = openSocket();

        socket.on("pack", (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_PACKAGES", payload: data.pack });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_PACKAGE", payload: + data.packageId });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleOpenPackageModal = () => {
        setSelectedPackage(null);
        setPackageModalOpen(true);
    };

    const handleClosePackageModal = () => {
        setSelectedPackage(null);
        setPackageModalOpen(false);
    };

    const handleEditPackage = (pack) => {
        setSelectedPackage(pack);
        setPackageModalOpen(true);
    };

    const handleDeletePackage = async (deletingId) => {
        try {
            await api.delete(`/packages/${deletingId}`);
            toast.success("Pacote deletado com sucesso!");
        } catch (err) {
            toastError(err);
        }
        setDeletingPackage(null);
    };

    const formatToBRL = (quantity) => {
        if (!quantity) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);

        let money = quantity.toFixed(2);
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(money);
    }

    const handleOpenHistoricModal = (pricing) => {
        setSelectedHistoric(pricing);
        setHistoricModalOpen(true);
    };

    const handleCloseHistoricModal = () => {
        setSelectedHistoric(null);
        setHistoricModalOpen(false);
    };

    return (
        <MainContainer>
            <PackageModal
                open={packageModalOpen}
                onClose={handleClosePackageModal}
                aria-labelledby="form-dialog-title"
                packageId={selectedPackage && selectedPackage.id}
            />
            <SystemChangeModal
                open={historicModalOpen}
                onClose={handleCloseHistoricModal}
                aria-labelledby="form-dialog-title"
                registerId={selectedHistoric && selectedHistoric.id}
                systemChange={2}
            />
            <ConfirmationModal
                title={'Deletar Pacote'}
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDeletePackage(deletingPackage.id)}
            >
                {"Você tem certeza que deseja deletar este pacote?"}
            </ConfirmationModal>
            <MainHeader>
                <Title>{"Pacotes"}</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        onClick={handleOpenPackageModal}
                        variant="contained"
                        color="primary"
                    >
                        {"Criar"}
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
                            <TableCell align="center">{"Nome"}</TableCell>
                            <TableCell align="center">{"Mensalidade"}</TableCell>
                            <TableCell align="center">{"Máx. Usuários"}</TableCell>
                            <TableCell align="center">{"Usuários Extras"}</TableCell>
                            <TableCell align="center">{"Preço por Usuário Extra"}</TableCell>
                            <TableCell align="center">{"Máx. Tickets por Mês"}</TableCell>
                            <TableCell align="center">{"Preço por Ticket Extra"}</TableCell>
                            <TableCell align="center">{"Máx. Whatsapps"}</TableCell>
                            <TableCell align="center">{"Mensalidade por Número Conectado"}</TableCell>
                            <TableCell align="center">{"Ações"}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {packages && packages.map((pack) => (
                            <TableRow key={pack.id}>
                                <TableCell align="center">{pack.name}</TableCell>
                                <TableCell align="center">{formatToBRL(pack.monthlyFee)}</TableCell>
                                <TableCell align="center">{pack.maxUsers}</TableCell>
                                <TableCell align="center">{pack.extraUsers || 0}</TableCell>
                                <TableCell align="center">{formatToBRL(pack.extraUserPrice)}</TableCell>
                                <TableCell align="center">{pack.maxTicketsByMonth}</TableCell>
                                <TableCell align="center">{formatToBRL(pack.extraTicketPrice)}</TableCell>
                                <TableCell align="center">{pack.maxWhatsapps}</TableCell>
                                <TableCell align="center">{formatToBRL(pack.whatsappMonthlyPrice)}</TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleEditPackage(pack)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenHistoricModal(pack)}
                                    >
                                        <HistoryIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            setDeletingPackage(pack);
                                            setConfirmModalOpen(true);
                                        }}
                                    >
                                        <DeleteOutline />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                            ))}
                        {loading && <TableRowSkeleton columns={10} />}
                    </TableBody>
                </Table>
        </Paper>
    </MainContainer>
  );
};

export default Packages;
