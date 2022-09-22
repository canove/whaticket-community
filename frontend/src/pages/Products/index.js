import React, { useEffect, useReducer, useState } from "react";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { TableCell } from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ProductModal from "../../components/ProductModal";

import { useTranslation } from "react-i18next";
import toastError from "../../errors/toastError";
import api from "../../services/api";

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

    useEffect(() => {
        dispatch({ type: "RESET" });
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get("/products/");
                dispatch({ type: "LOAD_PRODUCTS", payload: data });
            } catch (err) {
                toastError(err);
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

    return (
        <MainContainer>
            <ProductModal
                open={productModalOpen}
                onClose={handleCloseProductModal}
                aria-labelledby="form-dialog-title"
                userId={selectedProduct && selectedProduct.id}
            />
            <MainHeader>
                <Title>Produtos</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        onClick={handleOpenProductModal}
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
                            <TableCell>Nome do Produto</TableCell>
                            <TableCell>Valor da Mensalidade</TableCell>
                            <TableCell>Valor Custo Disparo</TableCell>
                            <TableCell>Taxa Juros Mensal</TableCell>
                            <TableCell>Multa Atraso</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    </TableBody>
                </Table>
        </Paper>
    </MainContainer>
  );
};

export default Products;
