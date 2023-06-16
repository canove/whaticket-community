import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import {
    Button,
    FormControl,
    IconButton,
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
    Tooltip,
    Typography
} from "@material-ui/core";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { format, parseISO } from "date-fns";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import SearchIcon from "@material-ui/icons/Search";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Brightness3, NightsStay, WbSunny } from "@material-ui/icons";

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

const CustomToolTip = ({ title, content, children }) => {
	const classes = useStyles();

	return (
		<Tooltip
			arrow
			classes={{
				tooltip: classes.tooltip,
				popper: classes.tooltipPopper,
			}}
			title={
				<React.Fragment>
					<Typography gutterBottom color="inherit">
						{title}
					</Typography>
					{content && <Typography>{content}</Typography>}
				</React.Fragment>
			}
		>
			{children}
		</Tooltip>
	);
};

const ChipsReports = () => {
    const classes = useStyles();
    const { i18n } = useTranslation();
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState([]);
    const [searchParam, setSearchParam] = useState("");
    const [status, setStatus] = useState("");
    const [hasMore, setHasMore] = useState(false);
    const [count, setCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [date, setDate] = useState("");

    useEffect(() => {
        setPageNumber(1);
    }, [searchParam, status, date]);

    useEffect(() => {
        setLoading(true);
        const fetchReports = async () => {
            try {
                const { data } = await api.get('/whatsapp/listReport/', {
                    params: { searchParam, status, pageNumber, date }
                });
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
    }, [searchParam, status, pageNumber, date]);

    const handleSearchParamChange = (e) => {
        setSearchParam(e.target.value);
    }

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    }

    const handleSleeping = async (sleeping, whatsappId) => {
		try {
			const { data } = await api.put(`/whatsapp/sleeping/${whatsappId}`, { sleeping });

            setReports(prevReports => {
                const whatsapp = data;
                const whatsappIndex = prevReports.findIndex((w) => w.whatsappId === whatsapp.id);

                prevReports[whatsappIndex].whatsapp = whatsapp;

                return [...prevReports];
            });
		} catch (err) {
			toastError(err);
		}
	}

    const getInteractionPercentage = (total, interaction) => {
        if (!total) return "-";

        const percentage = (interaction / total) * 100;

        return `${percentage.toFixed(2)}%`;
    }

    return (
        <MainContainer>
            <MainHeader>
                <Title>{i18n.t("chipReports.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <div style={{ display: "flex", alignItems: "end" }}>
                        <TextField
                            onChange={(e) => {
                                setDate(e.target.value);
                            }}
                            value={date}
                            label={"Data"}
                            InputLabelProps={{ shrink: true, required: true }}
                            type="date"
                        />
                        <TextField
                            style={{
                                marginLeft: "10px",
                            }}
                            placeholder={i18n.t("chipReports.grid.phoneNumber")}
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
                                marginLeft: "10px",
                            }}
                        >
                            <InputLabel id="status-select-label">
                                Status
                            </InputLabel>
                            <Select
                                labelId="status-select-label"
                                id="status-select"
                                value={status}
                                label="Status"
                                onChange={handleStatusChange}
                                style={{width: "150px"}}
                            >
                                <MenuItem value={""}>{i18n.t("chipReports.status.none")}</MenuItem>
                                <MenuItem value={"connected"}>{i18n.t("chipReports.status.connected")}</MenuItem>
                                <MenuItem value={"disconnected"}>{i18n.t("chipReports.status.disconnected")}</MenuItem>
                                <MenuItem value={"deleted"}>{i18n.t("chipReports.status.deleted")}</MenuItem>
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
                            <TableCell align="center">{i18n.t("chipReports.grid.phoneNumber")}</TableCell>
                            <TableCell align="center">{i18n.t("chipReports.grid.registerAmount")}</TableCell>
                            <TableCell align="center">{"Qtde. de Interações"}</TableCell>
                            <TableCell align="center">{"Porcentagem de Interação"}</TableCell>
                            <TableCell align="center">{i18n.t("chipReports.grid.createdAt")}</TableCell>
                            <TableCell align="center">{i18n.t("chipReports.grid.updatedAt")}</TableCell>
                            <TableCell align="center">{i18n.t("chipReports.grid.actions")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {reports && reports.map(report => (
                                <TableRow key={report.whatsappId}>
                                    <TableCell align="center">{report.whatsapp.name}</TableCell>
                                    <TableCell align="center">{report.qtdeRegisters}</TableCell>
                                    <TableCell align="center">{report.interaction}</TableCell>
                                    <TableCell align="center">{getInteractionPercentage(report.qtdeRegisters, report.interaction)}</TableCell>
                                    <TableCell align="center">{format(parseISO(report.whatsapp.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                                    <TableCell align="center">{format(parseISO(report.whatsapp.updatedAt), "dd/MM/yyyy HH:mm")}</TableCell>
                                    <TableCell align="center">
                                    { user.superAdmin &&
                                        <>
                                            { report.whatsapp.sleeping &&
                                                <CustomToolTip title={"Ativar disparos desse número"}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleSleeping(report.whatsapp.sleeping, report.whatsappId)}
                                                    >
                                                        <WbSunny />
                                                    </IconButton>
                                                </CustomToolTip>
                                            }
                                            { !report.whatsapp.sleeping && 
                                                <CustomToolTip title={"Desativar disparos desse número"}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleSleeping(report.whatsapp.sleeping, report.whatsappId)}
                                                    >
                                                        <Brightness3 />
                                                    </IconButton>
                                                </CustomToolTip>
                                            }
                                        </>
                                    }
                                    </TableCell>
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
						onClick={() => { setPageNumber(prevPageNumber => prevPageNumber - 1) }}
						disabled={ pageNumber === 1}
					>
						{i18n.t("importation.buttons.previousPage")}
					</Button>
					<Typography
						style={{ display: "inline-block", fontSize: "1.25rem" }}
					>
						{ pageNumber } / { Math.ceil(count / 15) }
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

export default ChipsReports;