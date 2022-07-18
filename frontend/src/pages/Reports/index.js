import React, { useEffect, useReducer, useRef, useState } from "react";

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

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";

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

    if (action.type === "RESET") {
        return [];
    }
};

    const Reports = () => {
    const classes = useStyles();

    const [loading, setLoading] = useState(false);
    const [users, dispatchUsers] = useReducer(reducer, []);
    const [reports, setReports] = useState([]);
    const [disableButton, setDisableButton] = useState(true);
    const [userId, setUserId] = useState("");
    const [initialDate, setInitialDate] = useState("");
    const [finalDate, setFinalDate] = useState("");
    const [pdf, setPdf] = useState();

    const filterReports = async () => {
        setDisableButton(true);
        await fetchReports();
        await createPdf();
        setDisableButton(false);
    }

    const downloadPdf = () => {
        const linkSource = `data:application/pdf;base64,${pdf}`;
        const downloadLink = document.createElement("a");
        const fileName = `report.pdf`;
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    const createPdf = async () => {
        if (!initialDate || !finalDate || !userId) {
            toast.error("Fill the form");
        } else {
            try {
                const { data } = await api.get(`/tickets-export-report-talk?initialDate=${initialDate}&finalDate=${finalDate}&userId=${userId}`);
                setPdf(data);
            } catch (err) {
                toastError(err)
            }
        }
    }

    useEffect(() => {
        dispatchUsers({ type: "RESET"});

    }, []);

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
                }
            };
            fetchUsers();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, []);

    const fetchReports = async () => {
        if (initialDate && finalDate && userId) {
            try {
                setLoading(true);
                const { data } = await api.get(`report-talk?initialDate=${initialDate}&finalDate=${finalDate}&user=${userId}`);
                setReports(data);
                setLoading(false);
            } catch (err) {
                toastError(err);
            }
        } else {
            toast.error("Fill the form")
        }
    };

    const handleSelectOption = (_, newValue) => {
        if (newValue) {
            setUserId(newValue.id);
        } else {
            setUserId("");
        }
	};

    const renderOptionLabel = option => {
        if (option.number) {
          return `${option.name} - ${option.number}`;
        } else {
          return `${option.name}`;
        }
    };

    return (
        <MainContainer>
            <MainHeader>
                <Title>{i18n.t("reports.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <Autocomplete
                        onChange={(e, newValue) => handleSelectOption(e, newValue)}
                        className={classes.root}
                        options={users}
                        getOptionLabel={renderOptionLabel}
                        renderInput={(params) =>
                            <TextField
                                {...params}
                                label={i18n.t("reports.form.user")}
                                InputLabelProps={{ required: true}}
                            />
                        }
                    />
                    <TextField
                        onChange={(e) => { setInitialDate(e.target.value) }}
                        label={i18n.t("reports.form.initialDate")}
                        InputLabelProps={{ shrink: true, required: true }}
                        type="date"
                    />
                    <TextField
                        onChange={(e) => { setFinalDate(e.target.value) }}
                        label={i18n.t("reports.form.finalDate")}
                        InputLabelProps={{ shrink: true, required: true }}
                        type="date"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={ filterReports }
                    >
                        {i18n.t("reports.buttons.filter")}
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={ downloadPdf }
                        disabled={ disableButton }
                    >
                        {i18n.t("reports.buttons.exportPdf")}
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
            >
                <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">{i18n.t("reports.table.messageId")}</TableCell>
                        <TableCell align="center">{i18n.t("reports.table.messageBody")}</TableCell>
                        <TableCell align="center">{i18n.t("reports.table.read")}</TableCell>
                        <TableCell align="center">{i18n.t("reports.table.mediaURL")}</TableCell>
                        <TableCell align="center">{i18n.t("reports.table.ticketId")}</TableCell>
                        <TableCell align="center">{i18n.t("reports.table.date")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <>
                        {reports.map((reportTalk) => (
                            <TableRow key={reportTalk.id}>
                                <TableCell align="center">{reportTalk.id}</TableCell>
                                <TableCell align="center">{reportTalk.body}</TableCell>
                                <TableCell align="center">{reportTalk.read}</TableCell>
                                <TableCell align="center">{reportTalk.mediaUrl}</TableCell>
                                <TableCell align="center">{reportTalk.ticketId}</TableCell>
                                <TableCell align="center">{format(parseISO(reportTalk.createdAt), "dd/MM/yy HH:mm")}</TableCell>
                            </TableRow>
                        ))
                        }

                        {loading}
                    </>
                </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
}

export default Reports;