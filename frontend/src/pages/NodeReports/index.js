import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import {
    Button,
    FormControl,
    InputAdornment,
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
import SearchIcon from "@material-ui/icons/Search";

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

const NodeReports = () => {
    const classes = useStyles();
    const { i18n } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [response, setResponse] = useState("");
    const [hasMore, setHasMore] = useState(false);
    const [count, setCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [flows, setFlows] = useState([]);
    const [flow, setFlow] = useState("");
    const [nodeId, setNodeId] = useState("");
    const [disableCsvButton, setDisableCsvButton] = useState(false);

    useEffect(() => {
        setPageNumber(1);
    }, [phoneNumber, response, flow, nodeId]);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/nodeRegisters/', {
                    params: { phoneNumber, response, flow, pageNumber, nodeId }
                });
                console.log(data);
                setReports(data.reports);
                setHasMore(data.hasMore);
                setCount(data.count);
                setLoading(false);
            } catch (err) {
                toastError(err);
                setLoading(false);
            }
        }

        fetchReports();
    }, [phoneNumber, response, pageNumber, flow, nodeId]);

    useEffect(() => {
        const fetchFlows = async () => {
            try {
                const { data } = await api.get("/flows", {
                  params: { type: "bits" }
                });
                setFlows(data);
              } catch (err) {
                toastError(err);
              }
        }

        fetchFlows();
    });

    const handlePhoneNumberChange = (e) => {
        setPhoneNumber(e.target.value);
    }

    const handleResponseChange = (e) => {
        setResponse(e.target.value);
    }

    const handleFlowChange = (e) => {
        setFlow(e.target.value);
    }

    const handleNodeIdChange = (e) => {
        setNodeId(e.target.value);
    }

    const createCsvFile = async () => {
        setDisableCsvButton(true);
        try {
            const { data } = await api.get('/nodeRegisters/exportCsv', {
                params: { phoneNumber, response, flow, nodeId, pageNumber: "0" }
            });
            setDisableCsvButton(false);
            return data;
        } catch (err) {
            toastError(err);
            setDisableCsvButton(false);
            return false;
        }
    }

    const downloadCsv = async () => {
        const csv = await createCsvFile();

        if (!csv) return;

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
                <Title>{i18n.t("nodeReports.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <div style={{ display: "flex", alignItems: "end" }}>
                        <TextField
                            placeholder={i18n.t("nodeReports.phoneNumber")}
                            type="search"
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon style={{ color: "gray" }} />
                                </InputAdornment>
                            ),
                            }}
                        />
                        <TextField
                            style={{
                                margin: "0 0 0 10px"
                            }}
                            placeholder={i18n.t("nodeReports.nodeId")}
                            type="search"
                            value={nodeId}
                            onChange={handleNodeIdChange}
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon style={{ color: "gray" }} />
                                </InputAdornment>
                            ),
                            }}
                        />
                        <FormControl
                            style={{
                                margin: "0 10px",
                            }}
                        >
                            <InputLabel id="flow-select-label">
                                {i18n.t("nodeReports.flow")}
                            </InputLabel>
                            <Select
                                labelId="flow-select-label"
                                id="flow-select"
                                value={flow}
                                label={i18n.t("nodeReports.flow")}
                                onChange={handleFlowChange}
                                style={{width: "150px"}}
                            >
                                <MenuItem value={""}>{i18n.t("nodeReports.none")}</MenuItem>
                                { flows.map(flow => {
                                    return (
                                        <MenuItem key={flow.id} value={flow.id}>{flow.name}</MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                        <FormControl
                            style={{
                                margin: "0 10px 0 0",
                            }}
                        >
                            <InputLabel id="response-select-label">
                                {i18n.t("nodeReports.response")}
                            </InputLabel>
                            <Select
                                labelId="response-select-label"
                                id="response-select"
                                value={response}
                                label={i18n.t("nodeReports.response")}
                                onChange={handleResponseChange}
                                style={{width: "150px"}}
                            >
                                <MenuItem value={""}>{i18n.t("nodeReports.none")}</MenuItem>
                                <MenuItem value={"true"}>{i18n.t("nodeReports.true")}</MenuItem>
                                <MenuItem value={"false"}>{i18n.t("nodeReports.false")}</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={downloadCsv}
                            disabled={disableCsvButton}
                        >
                            {i18n.t("nodeReports.exportCsv")}
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
                            <TableCell align="center">{i18n.t("nodeReports.phoneNumber")}</TableCell>
                            <TableCell align="center">{i18n.t("nodeReports.text")}</TableCell>
                            <TableCell align="center">{i18n.t("nodeReports.response")}</TableCell>
                            <TableCell align="center">{i18n.t("nodeReports.nodeId")}</TableCell>
                            <TableCell align="center">{i18n.t("nodeReports.flow")}</TableCell>
                            <TableCell align="center">{i18n.t("nodeReports.createdAt")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {reports && reports.map(report => (
                                <TableRow key={report.id}>
                                    <TableCell align="center">{report.phoneNumber}</TableCell>
                                    <TableCell align="center">{report.text}</TableCell>
                                    <TableCell align="center">{report.response}</TableCell>
                                    <TableCell align="center">{report.nodeId}</TableCell>
                                    <TableCell align="center">{report.flow.name}</TableCell>
                                    <TableCell align="center">{format(parseISO(report.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton columns={5} />}
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
					>
						{i18n.t("importation.buttons.previousPage")}
					</Button>
					<Typography
						style={{ display: "inline-block", fontSize: "1.25rem" }}
					>
						{ pageNumber } / { Math.ceil(count / 10) }
					</Typography>
					<Button
						variant="outlined"
						onClick={() => { setPageNumber(prevPageNumber => prevPageNumber + 1) }}
						disabled={ !hasMore }
					>
						{i18n.t("importation.buttons.nextPage")}
					</Button>
				</div>
            </Paper>
        </MainContainer>
    );
}

export default NodeReports;