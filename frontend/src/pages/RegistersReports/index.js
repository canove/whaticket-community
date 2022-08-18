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
    TableFooter,
    TableHead,
    TableRow,
    Typography
} from "@material-ui/core";

import toastError from "../../errors/toastError";
import api from "../../services/api";
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

const RegistersReports = () => {
    const classes = useStyles();
    const { i18n } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [creatingPdf, setCreatingPdf] = useState(false);
    const [disableButton, setDisableButton] = useState(true);
    const [files, setFiles] = useState([]);
    const [fileIds, setFileIds] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [registers, setRegisters] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [count, setCount] = useState(0);
    const [pdf, setPdf] = useState("");

    useEffect(() => {
        setLoading(true);
        const fetchFiles = async () => {
            try {
                const { data } = await api.get('file/list');
                setFiles(data);
            } catch (err) {
                toastError(err);
            }
        }
        fetchFiles();
    }, []);

    useEffect(() => {
        setPageNumber(1);
        setDisableButton(true);
    }, [fileIds, statuses])

    useEffect(() => {
        setLoading(true);
        const fetchRegisters = async () => {
            try {
               const { data } = await api.get(`registers/listReport/`, {
                params: { statuses, fileIds, pageNumber }
               });
               setRegisters(data.registers);
               setCount(data.count);
               setHasMore(data.hasMore);
            } catch (err) {
                toastError(err);
            }
        }
        fetchRegisters();
    }, [fileIds, statuses, pageNumber]);

    const handleFileSelectChange = (e) => {
        const {
            target: { value },
        } = e;

        if (value.includes("Todos")) {
            setFileIds([]);
        } else {
            setFileIds(typeof value === 'string' ? value.split(',') : value,);
        }
    }

    const handleStatusSelectChange = (e) => {
        const {
            target: { value },
        } = e;

        if (value.includes("Todos")) {
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

    const createPdf = async () => {
        setCreatingPdf(true);
        try {
            const { data } = await api.get(`/registers/exportPdf`, {
                params: { statuses, fileIds, pageNumber: "ALL" }
            });
            setPdf(data);
            setCreatingPdf(false);
            setDisableButton(false);
        } catch (err) {
             toastError(err);
        }
    }

    const downloadPdf = () => {
        const linkSource = `data:application/pdf;base64,${pdf}`;
        const downloadLink = document.createElement("a");
        const fileName = `report.pdf`;
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    return (
        <MainContainer>
            <MainHeader>
                <Title>{i18n.t("logReport.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <FormControl className={classes.root}>
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
                    <FormControl className={classes.root}>
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
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={createPdf}
                        disabled={creatingPdf}
                    >
                        {i18n.t("logReport.buttons.createPdf")}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={downloadPdf}
                        disabled={disableButton}
                    >
                        {i18n.t("logReport.buttons.exportPdf")}
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
                            <TableCell align="center">{i18n.t("logReport.grid.name")}</TableCell>
                            <TableCell align="center">{i18n.t("logReport.grid.sent")}</TableCell>
                            <TableCell align="center">{i18n.t("logReport.grid.delivered")}</TableCell>
                            <TableCell align="center">{i18n.t("logReport.grid.read")}</TableCell>
                            <TableCell align="center">{i18n.t("logReport.grid.errors")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {registers && (registers.map((register, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell align="center">{register.name}</TableCell>
                                        <TableCell align="center">{formatDate(register.sentAt)}</TableCell>
                                        <TableCell align="center">{formatDate(register.deliveredAt)}</TableCell>
                                        <TableCell align="center">{formatDate(register.readAt)}</TableCell>
                                        <TableCell align="center">{formatDate(register.errorAt)}</TableCell>
                                    </TableRow>
                                )
                            }))}
                            {loading}
                        </>
                    </TableBody>
                    <TableFooter>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handlePreviousPage}
                            disabled={pageNumber === 1}
                        >
                            {i18n.t("logReport.buttons.previous")}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNextPage}
                            disabled={pageNumber === Math.ceil(count / 20)}
                        >
                            {i18n.t("logReport.buttons.next")}
                        </Button>
                        <Typography>
                            {i18n.t("logReport.buttons.page")}{ pageNumber } / { Math.ceil(count / 20)}
                        </Typography>
                    </TableFooter>
                </Table>
            </Paper>
        </MainContainer>
    );
}

export default RegistersReports;