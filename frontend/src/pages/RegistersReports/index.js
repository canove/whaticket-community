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
    TableHead, 
    TableRow 
} from "@material-ui/core";

import toastError from "../../errors/toastError";
import api from "../../services/api";


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
    const [files, setFiles] = useState([]);
    const [fileId, setFileId] = useState("");
    const [status, setStatus] = useState("");

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

    const handleFileSelectChange = (e) => {
        setFileId(e.target.value);
    }

    const handleStatusSelectChange = (e) => {
        const {
            target: { value },
        } = e;

        setStatus(typeof value === 'string' ? value.split(',') : value,);

        console.log(status);
    }

    const getStatusById = (id) => {
        if (id === 0) {
            return "Aguardando Importação";
        } else if (id === 1) {
            return "Processando";
        } else if (id === 2) {
            return "Aguardando Aprovação";
        } else if (id === 3) {
            return "Erro";
        } else if (id === 4) {
            return "Aprovado";
        } else if (id === 5) {
            return "Disparando";
        } else if (id === 6) {
            return "Finalizado";
        } else if (id === 7) {
            return "Recusado";
        } else {
            return id;
        }
    };

    return (
        <MainContainer>
            <MainHeader>
                <Title>Relatórios de Registros</Title>
                <MainHeaderButtonsWrapper>
                    <FormControl className={classes.root}>
                        <InputLabel id="file-select-label">Arquivo</InputLabel>
                        <Select
                            className={classes.select}
                            labelId="file-select-label"
                            id="file-select"
                            value={fileId}
                            onChange={handleFileSelectChange}
                        >
                            <MenuItem value={""}>Todos</MenuItem>
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
                        <InputLabel id="status-select-label">Status</InputLabel>
                        <Select
                            className={classes.select}
                            labelId="status-select-label"
                            id="status-select"
                            value={status && getStatusById(status)}
                            onChange={handleStatusSelectChange}
                        >
                            <MenuItem value={""}>Todos</MenuItem>
                            <MenuItem value={"0"}>Aguardando Importação</MenuItem>
                            <MenuItem value={"1"}>Processando</MenuItem>
                            <MenuItem value={"2"}>Aguardando Aprovação</MenuItem>
                            <MenuItem value={"3"}>Erro</MenuItem>
                            <MenuItem value={"4"}>Aprovado</MenuItem>
                            <MenuItem value={"5"}>Disparando</MenuItem>
                            <MenuItem value={"6"}>Finalizado</MenuItem>
                            <MenuItem value={"7"}>Recusado</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color="primary"
                    >
                        Filtrar Relatórios
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
                    </TableRow>
                </TableHead>
                <TableBody>
                    <>
                        {loading}
                    </>
                </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
}

export default RegistersReports;