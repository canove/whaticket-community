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

    const [userValue, setUserValue] = useState("");
    const [initialDateValue, setInitialDateValue] = useState("");
    const [finalDateValue, setFinalDateValue] = useState("");

    const valueRefUser = useRef("");
    const valueRefInitialDate = useRef("");
    const valueRefFinalDate = useRef("");

    const catchUserId = () => {
           return userValue;
    }
    const filterReports = () => {

    const userId = catchUserId();

        fetchReports(userId);
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

    const fetchReports = async (userId) => {
      try {
          setLoading(true);
          const { data } = await api.get(`report-talk?initialDate=${initialDateValue}&finalDate=${finalDateValue}&user=${userId}`);
            setReports(data);
            setLoading(false);
          }catch (err) {
              toastError(err);
        }
    };
    const handleSelectOption = (e, newValue) => {
      setUserValue(newValue.id);
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
                                inputRef={valueRefUser}
                            />
                        }
                    />
                    <TextField
                        id="initialDate"
                        onChange={(e) => {
                          setInitialDateValue(e.target.value)
                        }}
                        label={i18n.t("reports.form.initialDate")}
                        InputLabelProps={{ shrink: true, required: true}}
                        type="date"
                        inputRef={valueRefInitialDate}
                    />
                    <TextField
                        id="finalDate"
                          onChange={(e) => {
                          setFinalDateValue(e.target.value)
                        }}
                        label={i18n.t("reports.form.finalDate")}
                        InputLabelProps={{ shrink: true, required: true }}
                        type="date"
                        inputRef={valueRefFinalDate}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={ filterReports }
                    >
                        {i18n.t("reports.buttons.filter")}
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