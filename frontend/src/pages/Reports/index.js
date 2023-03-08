import React, { useContext, useEffect, useReducer, useRef, useState } from "react";

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
import { AuthContext } from "../../context/Auth/AuthContext";

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

const Reports = () => {
    const classes = useStyles();
    const { i18n } = useTranslation();

    const { user } = useContext(AuthContext);

    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);

    const [reports, setReports] = useState([]);
    const [count, setCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    const [disablePDFButton, setDisablePDFButton] = useState(false);
    const [pdf, setPdf] = useState();
    
    const [pageNumber, setPageNumber] = useState(1);

    const [initialDate, setInitialDate] = useState("");
    const [finalDate, setFinalDate] = useState("");
    const [userId, setUserId] = useState("");
    const [company, setCompany] = useState("");
    const [contactNumber, setContactNumber] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get("/users/");
                setUsers(data.users);
            } catch (err) {
                toastError(err);
            }
        };

        const fetchCompanies = async () => {
            if (user.companyId != 1) return;
            try {
                const { data } = await api.get("/company");
                setCompanies(data.companies);
            } catch (err) {
                toastError(err);
            }
        }

        fetchUsers();
        fetchCompanies();
    }, []);

    const createPdf = async () => {
        try {
            const { data } = await api.get("/tickets-export-report-talk", {
                params: { initialDate, finalDate, userId, contactNumber, company }
            });

            setPdf(data);
            return data;
        } catch (err) {
            toastError(err)
            console.error(err);
        }
        return null;
    };

    const fetchReports = async () => {
        setLoading(true);

        try {
            const { data } = await api.get("/report-talk", { 
                params: { pageNumber, initialDate, finalDate, userId, contactNumber, company } 
            });

            setReports(data.messages);
            setCount(data.count);
            setHasMore(data.hasMore);
        } catch (err) {
            toastError(err);
        }

        setLoading(false);
    };

    const filterReports = async () => {
        setPageNumber(1);
        setPdf(null);
        await fetchReports();
    };

    const downloadPdf = async () => {
        let newPDF = null;

        if (!pdf) {
            setDisablePDFButton(true)
            newPDF = await createPdf();
            setDisablePDFButton(false);
        }

        const linkSource = `data:application/pdf;base64,${newPDF ?? pdf}`;
        const downloadLink = document.createElement("a");
        const fileName = `report.pdf`;
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    };

    const handleUserChange = (_, newValue) => {
        if (newValue) {
            setUserId(newValue.id);
        } else {
            setUserId("");
        }
	};

    const handleCompanyChange = (_, newValue) => {
        if (newValue) {
            setCompany(newValue.id);
        } else {
            setCompany("");
        }
	};

    const renderOptionLabel = option => {
        return option.name;
    };

    return (
        <MainContainer>
            <MainHeader>
                <Title>{i18n.t("reports.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <TextField
                            className={classes.search}
                            value={contactNumber}
                            placeholder={"xx(xx)xxxx-xxxx"}
                            onChange={(e) => setContactNumber(e.target.value)}
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PhoneIcon style={{ color: "gray" }}/>
                                </InputAdornment>
                            ),
                            }}
                        />
                        <Autocomplete
                            style={{ marginLeft: "10px" }}
                            onChange={(e, newValue) => handleUserChange(e, newValue)}
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
                        { user.companyId === 1 &&
                            <Autocomplete
                                style={{ marginLeft: "10px" }}
                                onChange={(e, newValue) => handleCompanyChange(e, newValue)}
                                className={classes.root}
                                options={companies}
                                getOptionLabel={renderOptionLabel}
                                renderInput={(params) =>
                                    <TextField
                                        {...params}
                                        label={"Empresas"}
                                        InputLabelProps={{ required: true}}
                                    />
                                }
                            />
                        }
                        <TextField
                            style={{ marginLeft: "10px" }}
                            onChange={(e) => { setInitialDate(e.target.value) }}
                            label={i18n.t("reports.form.initialDate")}
                            InputLabelProps={{ shrink: true, required: true }}
                            type="date"
                        />
                        <TextField
                            style={{ marginLeft: "10px" }}
                            onChange={(e) => { setFinalDate(e.target.value) }}
                            label={i18n.t("reports.form.finalDate")}
                            InputLabelProps={{ shrink: true, required: true }}
                            type="date"
                        />
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={ filterReports }
                        >
                            {i18n.t("reports.buttons.filter")}
                        </Button>
                        <Button
                            style={{ marginLeft: "10px" }}
                            variant="contained"
                            color="primary"
                            onClick={ downloadPdf }
                            disabled={ disablePDFButton }
                        >
                            {"Exportar PDF"}
                        </Button>
                    </div>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
            >
                <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">{"Operador"}</TableCell>
                        <TableCell align="center">{"Cliente"}</TableCell>
                        <TableCell align="center">{"Enviado Por"}</TableCell>
                        <TableCell align="center">{"Telefone"}</TableCell>
                        <TableCell align="center">{"Mensagem"}</TableCell>
                        <TableCell align="center">{"ID do Ticket"}</TableCell>
                        <TableCell align="center">{"Data"}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <>
                        {reports && reports.map((message) => (
                            <TableRow key={message.id}>
                                <TableCell align="center">{message.ticket.user ? message.ticket.user.name : "BOT"}</TableCell>
                                <TableCell align="center">{(message.ticket.contact && message.ticket.contact.name) ? message.ticket.contact.name : "DESCONHECIDO"}</TableCell>
                                <TableCell align="center">{message.fromMe ? "OPERADOR" : "CLIENTE"}</TableCell>
                                <TableCell align="center">{(message.ticket.contact && message.ticket.contact.number) ? message.ticket.contact.number : "DESCONHECIDO"}</TableCell>
                                <TableCell align="center">{message.mediaUrl ? `[MEDIA_URL: ${message.mediaUrl}]${message.body}` : message.body}</TableCell>
                                <TableCell align="center">{message.ticketId}</TableCell>
                                <TableCell align="center">{format(parseISO(message.createdAt), "dd/MM/yy HH:mm")}</TableCell>
                            </TableRow>
                        ))}
                        {loading && <TableRowSkeleton columns={7} />}
                    </>
                </TableBody>
                </Table>
                <div
					style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}
				>
					<Button
						variant="outlined"
						onClick={() => setPageNumber(prevPageNumber => prevPageNumber - 1)}
						disabled={pageNumber === 1}
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
						onClick={() => setPageNumber(prevPageNumber => prevPageNumber + 1)}
						disabled={!hasMore}
					>
						{i18n.t("logReport.buttons.nextPage")}
					</Button>
				</div>
            </Paper>
        </MainContainer>
    );
}

export default Reports;