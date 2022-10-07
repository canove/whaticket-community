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
import ProductModal from "../../components/ProductModal";

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
    if (action.type === "LOAD_PRODUCTS") {
        const products = action.payload;
        const newProducts = [];

        products.forEach((product) => {
            const productIndex = state.findIndex((p) => p.id === product.id);
            if (productIndex !== -1) {
                state[productIndex] = product;
            } else {
                newProducts.push(product);
            }
        });

        return [...state, ...newProducts];
    }

    if (action.type === "UPDATE_PRODUCTS") {
        const product = action.payload;
        const productIndex = state.findIndex((p) => p.id === product.id);

        if (productIndex !== -1) {
            state[productIndex] = product;
            return [...state];
        } else {
            return [product, ...state];
        }
    }

    if (action.type === "DELETE_PRODUCT") {
        const productId = action.payload;

        const productIndex = state.findIndex((p) => p.id === productId);
        if (productIndex !== -1) {
            state.splice(productIndex, 1);
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

const Products = () => {
    const classes = useStyles();
    const { i18n } = useTranslation();

    const [products, dispatch] = useReducer(reducer, []);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedHistoric, setSelectedHistoric] = useState(null);
    const [historicModalOpen, setHistoricModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch({ type: "RESET" });
    }, []);

    useEffect(() => {
        setLoading(true);
        const fetchProducts = async () => {
            try {
                const { data } = await api.get("/products/");
                dispatch({ type: "LOAD_PRODUCTS", payload: data });
                setLoading(false);
            } catch (err) {
                toastError(err);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const socket = openSocket();

        socket.on("product", (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_PRODUCTS", payload: data.product });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_PRODUCT", payload: + data.productId });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleOpenProductModal = () => {
        setSelectedProduct(null);
        setProductModalOpen(true);
    };

    const handleCloseProductModal = () => {
        setSelectedProduct(null);
        setProductModalOpen(false);
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setProductModalOpen(true);
    };

    const handleDeleteProduct = async (deletingId) => {
        try {
            await api.delete(`/products/${deletingId}`);
            toast.success(i18n.t("product.confirmation.delete"));
        } catch (err) {
            toastError(err);
        }
        setDeletingProduct(null);
    };

    function formatReal(num) {
        var p = num.toFixed(2).split(".");
        return "R$ " + p[0].split("").reverse().reduce(function(acc, num, i) {
            return num + (num !== "-" && i && !(i % 3) ? "." : "") + acc;
        }, "") + "," + p[1];
    };

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
            <ProductModal
                open={productModalOpen}
                onClose={handleCloseProductModal}
                aria-labelledby="form-dialog-title"
                productId={selectedProduct && selectedProduct.id}
            />
            <SystemChangeModal
                open={historicModalOpen}
                onClose={handleCloseHistoricModal}
                aria-labelledby="form-dialog-title"
                registerId={selectedHistoric && selectedHistoric.id}
                systemChange={0}
            />
            <ConfirmationModal
                title={
                deletingProduct &&
                `${i18n.t("product.confirmation.title")}`}
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDeleteProduct(deletingProduct.id)}
            >
                {i18n.t("product.confirmation.confirmDelete")}
            </ConfirmationModal>
            <MainHeader>
                <Title>{i18n.t("product.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        onClick={handleOpenProductModal}
                        variant="contained"
                        color="primary"
                    >
                        {i18n.t("product.buttons.created")}
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
                            <TableCell align="center">{i18n.t("product.grid.productName")}</TableCell>
                            <TableCell align="center">{i18n.t("product.grid.monthValue")}</TableCell>
                            <TableCell align="center">{i18n.t("product.grid.tripCostValue")}</TableCell>
                            <TableCell align="center">{i18n.t("product.grid.monthlyInterestRate")}</TableCell>
                            <TableCell align="center">{i18n.t("product.grid.penaltyMount")}</TableCell>
                            <TableCell align="center">{i18n.t("product.grid.actions")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {products && products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell align="center">{product.name}</TableCell>
                                <TableCell align="center">{formatReal(product.monthlyFee)}</TableCell>
                                <TableCell align="center">{formatReal(product.triggerFee)}</TableCell>
                                <TableCell align="center">{formatReal(product.monthlyInterestRate)}</TableCell>
                                <TableCell align="center">{formatReal(product.penaltyMount)}</TableCell>
                                <TableCell align="center">
                                <IconButton
                                    size="small"
                                    onClick={(e) => handleEditProduct(product)}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleOpenHistoricModal(product)}
                                >
                                    <HistoryIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                    setDeletingProduct(product);
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

export default Products;
