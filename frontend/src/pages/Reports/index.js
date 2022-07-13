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
import ReportsList from "../../components/ReportsList";

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
    // const [tickets, setTickets] = useState([]);

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

    // useEffect(() => {
    //     setLoading(true);
    //     const delayDebounceFn = setTimeout(() => {
    //         const fetchTickets = async() => {
    //             try {
    //                 const { data } = await api.get("/tickets", {})
    //                 setTickets(data.tickets)
    //                 setLoading(false)
    //             } catch (err) {
    //                 setLoading(false)
    //                 toastError(err)
    //             }
    //         }

    //         fetchTickets()
    //     }, 500)
    //     return () => clearTimeout(delayDebounceFn)
    // }, [])

    const valueRefUser = useRef("");
    const valueRefInitialDate = useRef("");
    const valueRefFinalDate = useRef("");

    const [userValue, setUserValue] = useState("");
    const [initialDateValue, setInitialDateValue] = useState("");
    const [finalDateValue, setFinalDateValue] = useState("");

    const filterReports = () => {
        setUserValue(valueRefUser.current.value);
        setInitialDateValue(valueRefInitialDate.current.value);
        setFinalDateValue(valueRefFinalDate.current.value);

        console.log(userValue, initialDateValue, finalDateValue)
    }

    // const reportsModel = () => {
    //     let userIndex;

    //     users.map(user => {
    //         if (user.name === userValue) {
    //             userIndex = user.id;
    //         }
    //     })

    //     tickets.map(ticket => {
    //         let ticketUserId = ticket.userId;
    //         let ticketInitialDate = ticket.createdAt.slice(0, 10);
    //         let ticketFinalDate = ticket.updatedAt.slice(0, 10);
    //         console.log(ticketUserId, ticketInitialDate, ticketFinalDate)
    //         console.log(userIndex, initialDateValue, finalDateValue)

    //         if (ticketUserId === userIndex && ticketInitialDate === initialDateValue && ticketFinalDate === finalDateValue) {
    //             console.log("DEU CERTO!");
    //         }
    //     });

    //     console.log(tickets)

    //     return (
    //         <TableRow>
    //             <TableCell align="center">{userValue}</TableCell>
    //             <TableCell align="center">{initialDateValue}</TableCell>
    //             <TableCell align="center">{finalDateValue}</TableCell>
    //             <TableCell align="center">{i18n.t("reports.table.actions")}</TableCell>
    //         </TableRow>
    //     );
    // }

    return (
        <MainContainer>
            <MainHeader>
                <Title>{i18n.t("reports.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <Autocomplete
                        className={classes.root}
                        options={users.map(user => (user.name))}
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
                        label={i18n.t("reports.form.initialDate")}
                        InputLabelProps={{ shrink: true, required: true}}
                        type="date"
                        inputRef={valueRefInitialDate}
                    />
                    <TextField
                        id="finalDate"
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
                        <TableCell align="center">{i18n.t("reports.table.initialDate")}</TableCell>
                        <TableCell align="center">{i18n.t("reports.table.finalDate")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <>
                        <ReportsList 
                            initialDate={initialDateValue}
                            finalDate={finalDateValue}
                        />
                    {/* {tickets.map(ticket => {
                        return (<TableRow>
                            <TableCell align="center">{ticket.userId}</TableCell>
                            <TableCell align="center">{ticket.createdAt}</TableCell>
                            <TableCell align="center">{ticket.updatedAt}</TableCell>
                            <TableCell align="center">{i18n.t("reports.table.actions")}</TableCell>
                        </TableRow>)
                    })}
                        
                        { reportsModel() } */}
                        {loading}
                    </>
                </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
}

export default Reports;
