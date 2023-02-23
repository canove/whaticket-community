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
import toastError from "../../errors/toastError";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { InputAdornment, Typography } from "@material-ui/core";
import PhoneIcon from '@material-ui/icons/Phone';

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
    search: {
        paddingTop: 16
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
    const { i18n } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [users, dispatchUsers] = useReducer(reducer, []);
    const [reports, setReports] = useState([]);
    const [disableButton, setDisableButton] = useState(false);
    const [userId, setUserId] = useState("");
    const [initialDate, setInitialDate] = useState("");
    const [finalDate, setFinalDate] = useState("");
    const [pdf, setPdf] = useState();
    const [pageNumber, setPageNumber] = useState(1);
    const [count, setCount] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [number, setNumber] = useState("");
    const firstRender = useRef(true);

    const filterReports = async () => {
        setPageNumber(1);
        await fetchReports();

    };

    const downloadPdf = async () => {
        setDisableButton(true)
        await createPdf();
        setDisableButton(false);

    };

    const createPdf = async () => {
        if (!initialDate || !finalDate || userId && number){
            toast.error(i18n.t("reports.errors.toastErr"));
        } else {
            try {
                const { data } = await api.get("/tickets-export-report-talk",{
                params: { initialDate, finalDate, userId, number }});
                setPdf(data);

                const linkSource = `data:application/pdf;base64,${pdf}`;
                const downloadLink = document.createElement("a");
                const fileName = `report.pdf`;
                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();
            } catch (err) {
                toastError(err)
                console.error(err);
            }
        }
    };

    useEffect(() => {
        dispatchUsers({ type: "RESET"});
        setPageNumber(1);
    }, []);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchUsers = async () => {
                try {
                    const { data } = await api.get("/users/")
                    dispatchUsers({ type: "LOAD_USERS", payload: data.users });
                    setHasMore(data.hasMore);
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
            if (!initialDate || !finalDate || userId && number){
                toast.error(i18n.t("reports.errors.toastErr"));
            } else {
            try {
                setLoading(true);
                const { data } = await api.get("/report-talk",
                    {params: { pageNumber, initialDate, finalDate, userId, number }});
                setReports(data.messages);
                setCount(data.count);
                setHasMore(data.hasMore);
                setLoading(false);
            } catch (err) {
                toastError(err);
            }}
    };

    useEffect(() => {
        if(firstRender.current === false){
            fetchReports()
        } else{
             firstRender.current = false;
        }

    },[pageNumber])

    const handleNextPage = () => {
        dispatchUsers({ type: "RESET"});
        setPageNumber(pageNumber + 1);
    };

    const handlePreviousPage = () => {
        dispatchUsers({ type: "RESET"});
        setPageNumber(pageNumber - 1);
    };

    const handleSelectOption = (_, newValue) => {
        if (newValue) {
            setUserId(newValue.id)
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

    const handleSearch = (newValue) => {
        if (newValue) {
            setNumber(newValue.target.value)
        } else {
            setNumber("");
        }
    };

    const isRead = read => {
        if (read === true) {
            return "Sim";
        }
        if (read === false) {
            return "Não";
        }
        return read;
    };

    return (
        <MainContainer>
            <MainHeader>
                <Title>{i18n.t("reports.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <TextField
                        className={classes.search}
                        options={number}
                        placeholder={"xx(xx)xxxx-xxxx"}
                        onChange={(e, newValue) => handleSearch(e, newValue)}
                        InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                            <PhoneIcon style={{ color: "gray" }}/>
                            </InputAdornment>
                        ),
                        }}
                    />
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
                        <TableCell align="center">Phone Number</TableCell>
                        <TableCell align="center">{i18n.t("reports.table.mediaURL")}</TableCell>
                        <TableCell align="center">{i18n.t("reports.table.ticketId")}</TableCell>
                        <TableCell align="center">{i18n.t("reports.table.date")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <>
                        {reports && reports.map((reportTalk) => (
                            <TableRow key={reportTalk.id}>
                                <TableCell align="center">{reportTalk.id}</TableCell>
                                <TableCell align="center">{reportTalk.body}</TableCell>
                                <TableCell align="center">{isRead(reportTalk.read)}</TableCell>
                                <TableCell align="center">{reportTalk.contact.number}</TableCell>
                                <TableCell align="center">{reportTalk.mediaUrl}</TableCell>
                                <TableCell align="center">{reportTalk.ticket.id}</TableCell>
                                <TableCell align="center">{format(parseISO(reportTalk.createdAt), "dd/MM/yy HH:mm")}</TableCell>
                            </TableRow>
                        ))
                        }
                        {loading && <TableRowSkeleton columns={7} />}
                    </>
                </TableBody>
                </Table>
                <div
					style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}
				>
					<Button
						variant="outlined"
						onClick={() => { setPageNumber(prevPageNumber => prevPageNumber - 1) }}
						disabled={ pageNumber === 1}
                        onChange={handlePreviousPage}
					>
						{i18n.t("logReport.buttons.previousPage")}
					</Button>
					<Typography
						style={{ display: "inline-block", fontSize: "1.25rem" }}
					>
						{ pageNumber } / { Math.ceil(count / 20) }
					</Typography>
					<Button
						variant="outlined"
						onClick={() => {
setPageNumber(prevPageNumber => prevPageNumber + 1) }}
						disabled={ !hasMore }
                        onChange={handleNextPage}
					>
						{i18n.t("logReport.buttons.nextPage")}
					</Button>
				</div>
            </Paper>
        </MainContainer>
    );
}

export default Reports;