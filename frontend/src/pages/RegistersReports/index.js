import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import {
    Button,
    FormControl,
    InputLabel,
    makeStyles,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@material-ui/core";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { format, parseISO } from "date-fns";
import TableRowSkeleton from "../../components/TableRowSkeleton";

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

const getCurrentDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const currentDate = `${year}-${month}-${day}`;

    return currentDate;
}

const RegistersReports = () => {
    const classes = useStyles();
    const { i18n } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [fileIds, setFileIds] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [registers, setRegisters] = useState([]);
    const [pdf, setPdf] = useState("");
    const [disablePdfButton, setDisablePdfButton] = useState(true);
    const [csv, setCsv] = useState("");
    const [disableCsvButton, setDisableCsvButton] = useState(true);
    const [pageNumber, setPageNumber] = useState(1);
	const [count, setCount] = useState(1);
	const [hasMore, setHasMore] = useState(false);
    const [initialDate, setInitialDate] = useState(getCurrentDate());
    const [finalDate, setFinalDate] = useState(getCurrentDate());
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const { data } = await api.get('file/list', {
                    params: { refusedStatus: 7 }
                });
                setFiles(data.reports);
            } catch (err) {
                toastError(err);
            }
        }
        fetchFiles();
    }, []);

    useEffect(() => {
        setPageNumber(1);
        setDisablePdfButton(true);
        setDisableCsvButton(true);
    }, [fileIds, statuses, initialDate, finalDate, name, phoneNumber])

    useEffect(() => {
        const createCsvFile = async () => {
            try {
                const { data } = await api.get(`/registers/exportCsv`, {
                    params: {
                        statuses,
                        fileIds,
                        pageNumber: "ALL",
                        initialDate,
                        finalDate
                    }
                });
                setCsv(data);
                setDisableCsvButton(false);
            } catch (err) {
                toastError(err);
                setDisableCsvButton(true);
            }
        }
        createCsvFile();
    }, [fileIds, statuses, initialDate, finalDate, name, phoneNumber])

    useEffect(() => {
        const createPdfFile = async () => {
            try {
                const { data } = await api.get(`/registers/exportPdf`, {
                    params: {
                        statuses,
                        fileIds,
                        pageNumber: "ALL",
                        initialDate,
                        finalDate
                    }
                });
                setPdf(data);
                setDisablePdfButton(false);
            } catch (err) {
                toastError(err);
                setDisablePdfButton(true);
            }
        }
        createPdfFile();
    }, [fileIds, statuses, initialDate, finalDate, name, phoneNumber])

    useEffect(() => {
        setLoading(true);
        const fetchRegisters = async () => {
            try {
               const { data } = await api.get(`registers/listReport/`, {
                params: {
                    statuses,
                    fileIds,
                    pageNumber,
                    initialDate,
                    finalDate,
                    name,
                    phoneNumber
                }
               });
               setRegisters(data.registers);
               setCount(data.count);
               setHasMore(data.hasMore);
               setLoading(false);
            } catch (err) {
                toastError(err);
                setLoading(false);
            }
        }
        fetchRegisters();
    }, [fileIds, statuses, pageNumber, initialDate, finalDate, name, phoneNumber]);

    const handleFileSelectChange = (e) => {
        const {
            target: { value },
        } = e;

        if (value.includes("all")) {
            setFileIds([]);
        } else {
            setFileIds(typeof value === 'string' ? value.split(',') : value,);
        }
    }

    const handleStatusSelectChange = (e) => {
        const {
            target: { value },
        } = e;

        if (value.includes("all")) {
            setStatuses([]);
        } else {
            setStatuses(typeof value === 'string' ? value.split(',') : value,);
        }
    }

    const handleNextPage = () => {
        setPageNumber(pageNumber + 1);
    }

    const handlePreviousPage = () => {
        setPageNumber(pageNumber - 1);
    }

    const formatDate = (date) => {
        if (date) {
            return format(parseISO(date), "dd/MM/yy HH:mm");
        }
        return date;
    }

    const getStatus = (register) => {
        if (register.errorAt) {
            return 'Erro';
        } else if (register.readAt) {
            return 'Lido';
        } else if (register.deliveredAt) {
            return 'Entregue';
        } else if (register.sentAt) {
            return 'Enviado';
        }
        return '';
    }

    const downloadPdf = () => {
        const linkSource = `data:application/pdf;base64,${pdf}`;
        const downloadLink = document.createElement("a");
        const fileName = `report.pdf`;
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    const downloadCsv = async () => {
        const encodedUri = encodeURI(csv);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "report.csv");
        document.body.appendChild(link);

        link.click();
    }

    return (
        <MainContainer>
            <MainHeader>
                <Title>{i18n.t("logReport.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <TextField
                            placeholder={"Telefone"}
                            type="search"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            // InputProps={{
                            // startAdornment: (
                            //     <InputAdornment position="start">
                            //         <SearchIcon style={{ color: "gray" }} />
                            //     </InputAdornment>
                            // ),
                            // }}
                        />
                        <TextField
                            style={{ marginLeft: "8px" }}
                            placeholder={"Nome"}
                            type="search"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            // InputProps={{
                            // startAdornment: (
                            //     <InputAdornment position="start">
                            //         <SearchIcon style={{ color: "gray" }} />
                            //     </InputAdornment>
                            // ),
                            // }}
                        />
                        <TextField
                            style={{ marginLeft: "8px" }}
                            onChange={(e) => { setInitialDate(e.target.value) }}
                            label={i18n.t("reports.form.initialDate")}
                            InputLabelProps={{ shrink: true, required: true }}
                            type="date"
                            value={initialDate}
                        />
                        <TextField
                            style={{ marginLeft: "8px" }}
                            onChange={(e) => { setFinalDate(e.target.value) }}
                            label={i18n.t("reports.form.finalDate")}
                            InputLabelProps={{ shrink: true, required: true }}
                            type="date"
                            value={finalDate}
                        />
                        <FormControl className={classes.root} style={{ marginLeft: "8px" }}>
                            <InputLabel id="file-select-label">{i18n.t("logReport.select.file")}</InputLabel>
                            <Select
                                className={classes.select}
                                labelId="file-select-label"
                                id="file-select"
                                value={fileIds}
                                onChange={handleFileSelectChange}
                                multiple
                            >
                                <MenuItem value={"all"}>{i18n.t("logReport.select.all")}</MenuItem>
                                {files && files.map((file, index) => {
                                    return (
                                        <MenuItem key={index} value={file.id}>
                                            {file.name}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <FormControl className={classes.root} style={{ marginLeft: "8px" }}>
                            <InputLabel id="status-select-label">{i18n.t("logReport.select.status")}</InputLabel>
                            <Select
                                className={classes.select}
                                labelId="status-select-label"
                                id="status-select"
                                value={statuses}
                                onChange={handleStatusSelectChange}
                                multiple
                            >
                                <MenuItem value={"all"}>{i18n.t("logReport.select.all")}</MenuItem>
                                <MenuItem value={"sent"}>{i18n.t("logReport.select.sent")}</MenuItem>
                                <MenuItem value={"delivered"}>{i18n.t("logReport.select.delivered")}</MenuItem>
                                <MenuItem value={"read"}>{i18n.t("logReport.select.read")}</MenuItem>
                                <MenuItem value={"error"}>{i18n.t("logReport.select.errors")}</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <Button
                            style={{ marginLeft: "8px" }}
                            variant="contained"
                            color="primary"
                            onClick={downloadPdf}
                            disabled={disablePdfButton}
                        >
                            {i18n.t("logReport.buttons.exportPdf")}
                        </Button>
                        <Button
                            style={{ marginLeft: "8px" }}
                            variant="contained"
                            color="primary"
                            onClick={downloadCsv}
                            disabled={disableCsvButton}
                        >
                            {i18n.t("logReport.buttons.exportCsv")}
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
                            <TableCell align="center">{i18n.t("logReport.grid.name")}</TableCell>
                            <TableCell align="center">{"Telefone"}</TableCell>
                            <TableCell align="center">{i18n.t("logReport.grid.status")}</TableCell>
                            <TableCell align="center">{i18n.t("logReport.grid.sent")}</TableCell>
                            <TableCell align="center">{i18n.t("logReport.grid.delivered")}</TableCell>
                            <TableCell align="center">{i18n.t("logReport.grid.read")}</TableCell>
                            <TableCell align="center">{i18n.t("logReport.grid.errors")}</TableCell>
                            <TableCell align="center">Processado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {registers && (registers.map((register, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell align="center">{register.name}</TableCell>
                                        <TableCell align="center">{register.phoneNumber}</TableCell>
                                        <TableCell align="center">{getStatus(register)}</TableCell>
                                        <TableCell align="center">{formatDate(register.sentAt)}</TableCell>
                                        <TableCell align="center">{formatDate(register.deliveredAt)}</TableCell>
                                        <TableCell align="center">{formatDate(register.readAt)}</TableCell>
                                        <TableCell align="center">{formatDate(register.errorAt)}</TableCell>
                                        <TableCell align="center">{formatDate(register.processedAt)}</TableCell>
                                    </TableRow>
                                )
                            }))}
                            {loading && <TableRowSkeleton columns={8} />}
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
						onClick={() => { setPageNumber(prevPageNumber => prevPageNumber + 1) }}
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

export default RegistersReports;