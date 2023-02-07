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
    const [company, setCompany] = useState(null);
    const [initialDate, setInitialDate] = useState("");
    const [finalDate, setFinalDate] = useState("");

    const fetchOperations = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/operations/", {
                params: { company, initialDate, finalDate }
            });
            setOperations(data);
        } catch (err) {
            toastError(err);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchOperations();
    }, []);

    useEffect(() => {
        const fetchCompanies = async () => {
            setLoading(true);
            try {
                const { data } = await api.get("/company");
                setCompanies(data.companies);
            } catch (err) {
                toastError(err);
            }
        }
        fetchCompanies();
    }, []);

    const formatTime = (milliseconds) => {
        let seconds = milliseconds / 1000;

        let minutes = Math.floor(seconds / 60);
        seconds = Math.floor((seconds / 60 - minutes) * 60);

        let hours = Math.floor(minutes / 60);
        minutes = Math.floor((minutes / 60 - hours) * 60);

        let secondsString = seconds.toString();
        let minutesString = minutes.toString();
        let hoursString = hours.toString();

        if (secondsString.length === 1) {
        secondsString = `0${secondsString}`;
        }

        if (minutesString.length === 1) {
        minutesString = `0${minutesString}`;
        }

        if (hoursString.length === 1) {
        hoursString = `0${hoursString}`;
        }

        return `${hoursString}:${minutesString}:${secondsString}`;
    };

    const formatToBRL = (quantity) => {
        let money = quantity.toFixed(2);

        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(money);
    }

    const getProcessed = (sent, noWhats) => {
        const s = sent ? parseInt(sent) : 0;
        const nw = noWhats ? parseInt(noWhats) : 0;

        return s + nw;
    }

    const getInQueue = (queue) => {
        return queue ? parseInt(queue) : 0;
    }

    const getAverageDeliveryTime = (config, connectedWhatsapps, queueCount) => {
        if (!config) return i18n.t("dashboard.messages.averageDeliveryTime.noConfig");
    
        let triggerIntervalCount = 0;
        let connectedWhatsappsCount = 0;
    
        let totalTriggerInterval = 0;
    
        connectedWhatsapps.forEach((whats) => {
          connectedWhatsappsCount += 1;
          triggerIntervalCount += 1;
    
          if (whats.connectionFile && whats.connectionFile.triggerInterval) {
            totalTriggerInterval += whats.connectionFile.triggerInterval;
          } else {
            totalTriggerInterval += config.triggerInterval;
          }
        });
    
        let queueCountInt = getInQueue(queueCount);
    
        if (queueCountInt > 0 && connectedWhatsappsCount === 0) return i18n.t("dashboard.messages.averageDeliveryTime.noConnectedWhatsapps");
        if (queueCountInt === 0 && connectedWhatsappsCount === 0) return "00:00:00";
    
        const triggerInterval = totalTriggerInterval / triggerIntervalCount;
    
        const averageDeliveryTimeMinutes =
          (queueCountInt / connectedWhatsappsCount) * triggerInterval;
        const averageDeliveryTimeMilliseconds = averageDeliveryTimeMinutes * 60000;
        const averageDeliveryTime = formatTime(averageDeliveryTimeMilliseconds);
    
        return averageDeliveryTime;
    };

    const getExpectedMonthTotalValue = (billingControls, pricing) => {
        if (!pricing) return formatToBRL(0);

        const now = new Date();
        const today = now.getDate();
      
        let triggerTotal = 0;
      
        for (const billingControl of billingControls) {
            const graceTriggers = billingControl.usedGraceTriggers;
            const triggerFee = billingControl.triggerFee;
            const quantity = billingControl.quantity;
      
            triggerTotal = triggerTotal + (triggerFee * (quantity - graceTriggers));
        }
        
        const totalMonthValue = pricing.product.monthlyFee;
        const totalTriggerValue = triggerTotal;
        
        const expectedTotalMonthValue = ((totalTriggerValue / today) * 30) + totalMonthValue;
      
        return formatToBRL(expectedTotalMonthValue);
    }

    const handleCompanySelectOption = (_, newValue) => {
        if (newValue === null) {
            setCompany("");
        } else {
            setCompany(newValue.id);
        }
      }
    
    const renderOptionLabel = (option) => {
        return option.name;
    };

    const handleFilter = () => {
        fetchOperations();
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
                                width: "180px",
                                display: "inline-flex"
                            }}
                            options={companies}
                            getOptionLabel={renderOptionLabel}
                            onChange={(e, newValue) => handleCompanySelectOption(e, newValue)}
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
                            <TableCell align="center">{i18n.t("operations.table.averageDeliveryTime")}</TableCell>
                            <TableCell align="center">{i18n.t("operations.table.expectedMonthValue")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {operations && operations.map((operation) => (
                                <TableRow key={operation.company.id}>
                                <TableCell align="center">{operation.company.name}</TableCell>
                                <TableCell align="center">{operation.fileRegisters.total}</TableCell>
                                <TableCell align="center">{getProcessed(operation.fileRegisters.sent, operation.fileRegisters.noWhats)}</TableCell>
                                <TableCell align="center">{getInQueue(operation.fileRegisters.queue)}</TableCell>
                                <TableCell align="center">{getAverageDeliveryTime(operation.company.config, operation.company.whatsapps, operation.fileRegisters.queue)}</TableCell>
                                <TableCell align="center">{getExpectedMonthTotalValue(operation.company.billingControls, operation.company.pricing)}</TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton columns={6} />}
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default Operations;
