import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
    TextField,
  } from "@material-ui/core";

import { AuthContext } from "../../context/Auth/AuthContext";

import Title from "../../components/Title";
import MainHeader from "../../components/MainHeader";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import MainContainer from "../../components/MainContainer";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Autocomplete from "@material-ui/lab/Autocomplete";

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

const Operations = () => {
    const classes = useStyles();
    const { i18n } = useTranslation();
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);

    const [operations, setOperations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [initialDate, setInitialDate] = useState("");
    const [finalDate, setFinalDate] = useState("");

    const [selectedCompanies, setSelectedCompanies] = useState([]);

    const fetchOperations = async () => {
        setLoading(true);
        setOperations([]);
        try {
            const { data } = await api.get("/operations/", {
                params: { 
                    initialDate, 
                    finalDate, 
                    companyIds: selectedCompanies.map(company => company.id) 
                }
            });
            setOperations(data);
        } catch (err) {
            toastError(err);
        }
        setLoading(false);
    }

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const { data } = await api.get("/company");
                setCompanies(data.companies);
            } catch (err) {
                toastError(err);
            }
        }
        fetchCompanies();
    }, []);

    const renderOptionLabel = (option) => {
        return option.name;
    };

    const handleFilter = () => {
        fetchOperations();
    }

    const getActiveWhatsapps = (whatsapps = []) => {
        const activeWhatsapps = whatsapps.filter(whats => (whats.status === "CONNECTED"));

        return activeWhatsapps.length;
    }
    
    const getSleepingWhatsapps = (whatsapps = []) => {
        const sleepingWhatsapps = whatsapps.filter(whats => (whats.sleeping));

        return sleepingWhatsapps.length;
    }
    
    const getDisconnectedWhatsapps = (whatsapps = []) => {
        const disconnectedWhatsapps = whatsapps.filter(whats => (whats.status !== "CONNECTED"));

        return disconnectedWhatsapps.length;
    }

    return (
        <MainContainer>
            <MainHeader>
                <Title>{i18n.t("operations.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <div style={{ display: "flex", alignItems: "bottom" }}>
                        <Autocomplete
                            style={{
                                margin: "0 10px",
                                width: "300px",
                                display: "inline-flex"
                            }}
                            limitTags={1}
                            multiple
                            options={companies}
                            getOptionLabel={renderOptionLabel}
                            onChange={(e, newValue) => setSelectedCompanies(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={i18n.t("operations.companies")}
                                    InputLabelProps={{ required: true }}
                                />
                            )}
                        />
                        <TextField
                            onChange={(e) => { setInitialDate(e.target.value) }}
                            value={initialDate}
                            label={i18n.t("operations.initialDate")}
                            InputLabelProps={{ shrink: true, required: true }}
                            type="date"
                            style={{ marginRight: "10px" }}
                        />
                        <TextField
                            onChange={(e) => { setFinalDate(e.target.value) }}
                            value={finalDate}
                            label={i18n.t("operations.finalDate")}
                            InputLabelProps={{ shrink: true, required: true }}
                            type="date"
                            style={{ marginRight: "10px" }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleFilter}
                        >
                            {i18n.t("operations.filter")}
                        </Button>
                    </div>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper className={classes.mainPaper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">{i18n.t("operations.table.name")}</TableCell>
                            <TableCell align="center">{i18n.t("operations.table.qtdeImports")}</TableCell>
                            <TableCell align="center">{i18n.t("operations.table.qtdeProcessed")}</TableCell>
                            <TableCell align="center">{i18n.t("operations.table.inQueue")}</TableCell>
                            <TableCell align="center">{"Números Ativos"}</TableCell>
                            <TableCell align="center">{"Números Pausados"}</TableCell>
                            <TableCell align="center">{"Números Desconectados"}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {loading && <TableRowSkeleton columns={7} />}
                            {operations && operations.map((operation) => (
                                <TableRow key={operation.company.id} hover>
                                    <TableCell align="center">{operation.company.name}</TableCell>
                                    <TableCell align="center">{operation.registers.total || 0}</TableCell>
                                    <TableCell align="center">{operation.registers.processed || 0}</TableCell>
                                    <TableCell align="center">{operation.registers.queue || 0}</TableCell>
                                    <TableCell align="center">{getActiveWhatsapps(operation.company.whatsapps)}</TableCell>
                                    <TableCell align="center">{getSleepingWhatsapps(operation.company.whatsapps)}</TableCell>
                                    <TableCell 
                                        align="center"
                                        style={{ 
                                            backgroundColor: (getDisconnectedWhatsapps(operation.company.whatsapps) > 0) ? "#E9967A" : null
                                        }}
                                    >
                                        {getDisconnectedWhatsapps(operation.company.whatsapps)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell align="center">{"TOTAL"}</TableCell>
                                <TableCell align="center">{/* Qtde. Importados */}
                                    {operations && operations.reduce((accumulator, operation) => {
                                        const value = operation.registers.total || 0

                                        return accumulator + value;
                                    }, 0)}
                                </TableCell>
                                <TableCell align="center">{/* Qtde. Processados */}
                                    {operations && operations.reduce((accumulator, operation) => {
                                        const value = operation.registers.processed || 0;

                                        return accumulator + value;
                                    }, 0)}
                                </TableCell>
                                <TableCell align="center">{/* Qtde. na Fila */}
                                    {operations && operations.reduce((accumulator, operation) => {
                                        const value = operation.registers.queue || 0;

                                        return accumulator + value;
                                    }, 0)}
                                </TableCell>
                                <TableCell align="center">{/* Números Ativos */}
                                    {operations && operations.reduce((accumulator, operation) => {
                                        const value = getActiveWhatsapps(operation.company.whatsapps);

                                        return accumulator + value;
                                    }, 0)}
                                </TableCell>
                                <TableCell align="center">{/* Números Pausados */}
                                    {operations && operations.reduce((accumulator, operation) => {
                                        const value = getSleepingWhatsapps(operation.company.whatsapps);

                                        return accumulator + value;
                                    }, 0)}
                                </TableCell>
                                <TableCell align="center">{/* Números Desconectados */}
                                    {operations && operations.reduce((accumulator, operation) => {
                                        const value = getDisconnectedWhatsapps(operation.company.whatsapps);

                                        return accumulator + value;
                                    }, 0)}
                                </TableCell>
                            </TableRow>
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default Operations;
