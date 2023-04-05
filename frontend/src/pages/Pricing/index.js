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
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import TableRowSkeleton from "../../components/TableRowSkeleton";

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
    const [deletingPricing, setDeletingPricing] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch({ type: "RESET" });
    }, []);

    useEffect(() => {
        setLoading(true);
        const fetchPricings = async () => {
            try {
                const { data } = await api.get("/pricings/");
                dispatch({ type: "LOAD_PRICINGS", payload: data });
                setLoading(false);
            } catch (err) {
                toastError(err);
                setLoading(false);
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
            return `${i18n.t("pricing.grid.active")}`;
        }

        if (status === "inativo") {
            return `${i18n.t("pricing.grid.inactive")}`;
        }

        if (status === "inadimplente") {
            return `${i18n.t("pricing.grid.defaulter")}`;
        }

        if (status === "bloqueado") {
            return `${i18n.t("pricing.grid.blocked")}`;
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

    const handleDeletePricing = async (deletingId) => {
        try {
            await api.delete(`/pricings/${deletingId}`);
            toast.success(i18n.t("pricing.confirmation.delete"));
        } catch (err) {
            toastError(err);
        }
        setDeletingPricing(null);
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
            <ConfirmationModal
                title={deletingPricing && `${i18n.t("pricing.confirmation.title")}`}
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDeletePricing(deletingPricing.id)}
            >
                {i18n.t("pricing.confirmation.confirmDelete")}
            </ConfirmationModal>
            <MainHeader>
                <Title>{i18n.t("pricing.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        onClick={handleOpenPricingModal}
                        variant="contained"
                        color="primary"
                    >
                      {i18n.t("pricing.buttons.create")}
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
                            <TableCell align="center">{i18n.t("pricing.grid.company")}</TableCell>
                            <TableCell align="center">{i18n.t("pricing.grid.registeredProduct")}</TableCell>
                            <TableCell align="center">{"Pacote"}</TableCell>
                            <TableCell align="center">{i18n.t("pricing.grid.status")}</TableCell>
                            <TableCell align="center">{i18n.t("pricing.grid.gracePeriod")}</TableCell>
                            <TableCell align="center">{i18n.t("pricing.grid.lackOfShots")}</TableCell>
                            <TableCell align="center">{i18n.t("pricing.grid.customerSince")}</TableCell>
                            <TableCell align="center">{i18n.t("pricing.grid.actions")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { pricings && pricings.map(pricing => {
                            return (
                                <TableRow key={pricing.id}>
                                    <TableCell align="center">{pricing.company.name}</TableCell>
                                    <TableCell align="center">{pricing.product ? pricing.product.name : ""}</TableCell>
                                    <TableCell align="center">{pricing.package ? pricing.package.name : ""}</TableCell>
                                    <TableCell align="center">{formatStatus(pricing.company.status)}</TableCell>
                                    <TableCell align="center">{pricing.gracePeriod}</TableCell>
                                    <TableCell align="center">{pricing.graceTrigger}</TableCell>
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
                                            onClick={() => {
                                                setDeletingPricing(pricing);
                                                setConfirmModalOpen(true);
                                            }}
                                        >
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {loading && <TableRowSkeleton columns={6} />}
                    </TableBody>
                </Table>
        </Paper>
    </MainContainer>
  );
};

export default Pricing;
