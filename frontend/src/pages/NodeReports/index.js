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
    const [searchParam, setSearchParam] = useState("");
    const [response, setResponse] = useState("");
    const [hasMore, setHasMore] = useState(false);
    const [count, setCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        setPageNumber(1);
    }, [searchParam, response]);

    useEffect(() => {
        // setLoading(true);
        // const fetchReports = async () => {
        //     try {
        //         const { data } = await api.get('/nodeRegisters/', {
        //             params: { searchParam, response, pageNumber }
        //         });
        //         setReports(data.reports);
        //         setHasMore(data.hasMore);
        //         setCount(data.count);
        //         setLoading(false);
        //     } catch (err) {
        //         toastError(err);
        //         setLoading(false);
        //     }
        // }

        // fetchReports();
    }, [searchParam, response, pageNumber]);

    const handleSearchParamChange = (e) => {
        setSearchParam(e.target.value);
    }

    const handleResponseChange = (e) => {
        setResponse(e.target.value);
    }

    return (
        <MainContainer>
            <MainHeader>
                <Title>Node Reports</Title>
                <MainHeaderButtonsWrapper>
                    <div style={{ display: "flex", alignItems: "end" }}>
                        <TextField
                            placeholder="Phone Number"
                            type="search"
                            value={searchParam}
                            onChange={handleSearchParamChange}
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
                            <InputLabel id="response-select-label">
                                Response
                            </InputLabel>
                            <Select
                                labelId="response-select-label"
                                id="response-select"
                                value={response}
                                label="Response"
                                onChange={handleResponseChange}
                                style={{width: "150px"}}
                            >
                                <MenuItem value={""}>None</MenuItem>
                                <MenuItem value={"true"}>True</MenuItem>
                                <MenuItem value={"false"}>False</MenuItem>
                            </Select>
                        </FormControl>
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
                            <TableCell align="center">Phone Number</TableCell>
                            <TableCell align="center">Text</TableCell>
                            <TableCell align="center">Response</TableCell>
                            <TableCell align="center">Node ID</TableCell>
                            <TableCell align="center">Flow ID</TableCell>
                            <TableCell align="center">CreatedAt</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {reports && reports.map(report => (
                                <TableRow key={report.whatsapp.id}>
                                    <TableCell align="center">{report.phoneNumber}</TableCell>
                                    <TableCell align="center">{report.text}</TableCell>
                                    <TableCell align="center">{report.response}</TableCell>
                                    <TableCell align="center">{report.nodeId}</TableCell>
                                    <TableCell align="center">{report.flowId}</TableCell>
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