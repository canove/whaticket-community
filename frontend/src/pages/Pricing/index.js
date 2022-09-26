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
import PricingModal from "../../components/PricingModal";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import HistoryIcon from '@material-ui/icons/History';
import EditIcon from "@material-ui/icons/Edit";

import { useTranslation } from "react-i18next";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { parseISO, format } from "date-fns";
import SystemChangeModal from "../../components/SystemChangeModal";

const reducer = (state, action) => {
    if (action.type === "LOAD_PRICINGS") {
        const pricings = action.payload;
        const newPricings = [];

        pricings.forEach((pricing) => {
            const pricingIndex = state.findIndex((p) => p.id === pricing.id);
            if (pricingIndex !== -1) {
                state[pricingIndex] = pricing;
            } else {
                newPricings.push(pricing);
            }
        });

        return [...state, ...newPricings];
    }

    if (action.type === "UPDATE_PRICINGS") {
        const pricing = action.payload;
        const pricingIndex = state.findIndex((p) => p.id === pricing.id);

        if (pricingIndex !== -1) {
            state[pricingIndex] = pricing;
            return [...state];
        } else {
            return [pricing, ...state];
        }
    }

    if (action.type === "DELETE_PRICING") {
        const pricingId = action.payload;

        const pricingIndex = state.findIndex((p) => p.id === pricingId);
        if (pricingIndex !== -1) {
            state.splice(pricingIndex, 1);
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

const Pricing = () => {
    const classes = useStyles();
    const { i18n } = useTranslation();

    const [pricings, dispatch] = useReducer(reducer, []);
    const [selectedPricing, setSelectedPricing] = useState(null);
    const [pricingModalOpen, setPricingModalOpen] = useState(false);
    const [selectedHistoric, setSelectedHistoric] = useState(null);
    const [historicModalOpen, setHistoricModalOpen] = useState(false);

    useEffect(() => {
        dispatch({ type: "RESET" });
    }, []);

    useEffect(() => {
        const fetchPricings = async () => {
            try {
                const { data } = await api.get("/pricings/");
                dispatch({ type: "LOAD_PRICINGS", payload: data });
            } catch (err) {
                toastError(err);
            }
        };
        fetchPricings();
    }, []);

    useEffect(() => {
        const socket = openSocket();

        socket.on("pricing", (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_PRICINGS", payload: data.pricing });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_PRICING", payload: + data.pricingId });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleOpenPricingModal = () => {
        setSelectedPricing(null);
        setPricingModalOpen(true);
    };

    const handleClosePricingModal = () => {
        setSelectedPricing(null);
        setPricingModalOpen(false);
    };

    const handleEditPricing = (pricing) => {
        setSelectedPricing(pricing);
        setPricingModalOpen(true);
    };

    const formatDate = (date) => {
        if (date) {
            return format(parseISO(date), "dd/MM/yyyy HH:mm");
        }

        return date;
    }

    const formatStatus = (status) => {
        if (status === "ativo") {
            return "Ativo";
        }

        if (status === "inativo") {
            return "Inativo";
        }

        if (status === "inadimplente") {
            return "Inadimplente";
        }

        if (status === "bloqueado") {
            return "Bloqueado"
        }

        return status;
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
            <PricingModal
                open={pricingModalOpen}
                onClose={handleClosePricingModal}
                aria-labelledby="form-dialog-title"
                pricingId={selectedPricing && selectedPricing.id}
            />
            <SystemChangeModal
                open={historicModalOpen}
                onClose={handleCloseHistoricModal}
                aria-labelledby="form-dialog-title"
                registerId={selectedHistoric && selectedHistoric.id}
                systemChange={1}
            />
            <MainHeader>
                <Title>Precificação</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        onClick={handleOpenPricingModal}
                        variant="contained"
                        color="primary"
                    >
                        Criar
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
                            <TableCell align="center">Empresa</TableCell>
                            <TableCell align="center">Produto Constratado</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Periodo de Carência (dias)</TableCell>
                            <TableCell align="center">Carência de Disparos</TableCell>
                            <TableCell align="center">Valor a Pagar</TableCell>
                            <TableCell align="center">Valor Pago</TableCell>
                            <TableCell align="center">Cliente Desde De</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { pricings && pricings.map(pricing => {
                            return (
                                <TableRow key={pricing.id}>
                                    <TableCell align="center">{pricing.company.name}</TableCell>
                                    <TableCell align="center">{pricing.product.name}</TableCell>
                                    <TableCell align="center">{formatStatus(pricing.company.status)}</TableCell>
                                    <TableCell align="center">{pricing.gracePeriod}</TableCell>
                                    <TableCell align="center">{pricing.graceTrigger}</TableCell>
                                    <TableCell align="center">Valor a Pagar</TableCell>
                                    <TableCell align="center">Valor Pago</TableCell>
                                    <TableCell align="center">{formatDate(pricing.createdAt)}</TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditPricing(pricing)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenHistoricModal(pricing)}
                                        >
                                            <HistoryIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                        >
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
        </Paper>
    </MainContainer>
  );
};

export default Pricing;
