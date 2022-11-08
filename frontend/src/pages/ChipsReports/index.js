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

const ChipsReports = () => {
    const classes = useStyles();
    const { i18n } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState([]);
    const [searchParam, setSearchParam] = useState("");

    useEffect(() => {
        setLoading(true);
        const fetchReports = async () => {
            try {
                const { data } = await api.get('/whatsapp/listReport/', {
                    params: { searchParam }
                });
                setReports(data.reports);
                setLoading(false);
            } catch (err) {
                toastError(err);
                setLoading(false);
            }
        }

        fetchReports();
    }, [searchParam]);

    const handleSearchParamChange = (e) => {
        setSearchParam(e.target.value);
    }

    return (
        <MainContainer>
            <MainHeader>
                <Title>Chips Reports</Title>
                <MainHeaderButtonsWrapper>
                    <TextField
                        placeholder="Número"
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
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Número</TableCell>
                            <TableCell align="center">Qtde de Registros</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {reports && reports.map(report => (
                                <TableRow key={report.whatsapp.id}>
                                    <TableCell align="center">{report.whatsapp.name}</TableCell>
                                    <TableCell align="center">{report.qtdeRegisters}</TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton columns={2} />}
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
}

export default ChipsReports;