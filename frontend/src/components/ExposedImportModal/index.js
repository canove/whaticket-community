import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	TextField,
    Typography,
  } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import axios from "axios";
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import ConfirmationModal from "../ConfirmationModal";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",

	},
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
      },

	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(3),
		},
	},

	btnWrapper: {
		position: "relative",
	},

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
}));

const ExposedImportModal = ({ open, onClose, exposedImportId }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();
    const { whatsApps } = useContext(WhatsAppsContext);

    const [name, setName] = useState("");
    const [token, setToken] = useState("");
    const [payload, setPayload] = useState("");

    const initialMapping = {
        name: "",
        phoneNumber: "",
        documentNumber: "",
        template: "",
        templateParams: "",
        message: "",
        var1: "",
        var2: "",
        var3: "",
        var4: "",
        var5: "",
    }
    const [mapping, setMapping] = useState(initialMapping);
    const [mappingValues, setMappingValues] = useState(initialMapping);

    const [connectionType, setConnectionType] = useState(false);
    const [useConnectionType, setUseConnectionType] = useState(false);
    const [openConnectionSelect, setOpenConnectionSelect] = useState(false);
    const [connections, setConnections] = useState([]);

    const [menus, setMenus] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [template, setTemplate] = useState("");

	useEffect(() => {
        const fetchExposedImport = async () => {
            try {
                const { data } = await api.get(`/exposedImports/${exposedImportId}`);
                setName(data.name);
                setMapping(JSON.parse(data.mapping));

                setConnectionType(data.official);
                setTemplate(data.templateId);
                setConnections(data.whatsappIds ? data.whatsappIds.split(",") : ["Todos"]);
            } catch (err) {
                toastError(err);
            }
        }

        const fetchApiToken = async () => {
            try {
                const { data } = await api.get("/settings");
                const { value } = data.find(s => s.key === "userApiToken");
                setToken(value);
            } catch (err) {
                toastError(err);
            }
        };

        const fetchTemplates = async () => {
			try {
				const { data } = await api.get('/TemplatesData/list/');
				setTemplates(data.templates);
			} catch (err) {
				toastError(err);
			}
		}

        const fetchMenus = async () => {
			try {
				const { data } = await api.get('menus/company');
				setMenus(data);
			} catch(err) {
				toastError(err);
			}
		}

        if (open) {
            fetchMenus();
            fetchTemplates();
        }

        if (exposedImportId) {
            fetchExposedImport();
            fetchApiToken();
        }
	}, [open, exposedImportId]);

    useEffect(() => {
		if (menus) {
			let offWhats = false;
			let noOffWhats = false;

			menus.forEach(menu => {
				if (menu.name === "Official Connections") {
					offWhats = true;
				}

				if (menu.name === "Connections") {
					noOffWhats = true;
				}
			})

			if (offWhats && noOffWhats) {
				setUseConnectionType(true);
			}

			if (offWhats && !noOffWhats) {
				setUseConnectionType(false);
				setConnectionType(true);
			}

			if (!offWhats && noOffWhats) {
				setUseConnectionType(false);
				setConnectionType(false);
			}
		}
	}, [menus]);

    const handleClose = () => {
        setName("");
        setPayload("");

        setMapping(initialMapping);
        setMappingValues(initialMapping);

        setConnectionType(false);
        setUseConnectionType(false);
        setOpenConnectionSelect(false);
        setTemplate("");
        setConnections([]);

        onClose();
	};

	const handleSubmit = async () => {
        const importData = {
            name,
            mapping: JSON.stringify(mapping),
            template: template,
            connections: connections,
            connectionType
        };

        try {
            if (exposedImportId) {
                await api.put(`/exposedImports/${exposedImportId}`, importData);
                toast.success(i18n.t("exposedImports.modal.editSuccess"));
            } else {
                await api.post("/exposedImports/", importData);
                toast.success(i18n.t("exposedImports.modal.createSuccess"));
            }
            } catch (err) {
                toastError(err);
        }

        handleClose();
	};

    useEffect(() => {
        if (payload) {
            handleRelationChange(mapping.name, "name");
            handleRelationChange(mapping.phoneNumber, "phoneNumber");
            handleRelationChange(mapping.documentNumber, "documentNumber");
            handleRelationChange(mapping.template, "template");
            handleRelationChange(mapping.templateParams, "templateParams");
            handleRelationChange(mapping.message, "message");
            handleRelationChange(mapping.var1, "var1");
            handleRelationChange(mapping.var2, "var2");
            handleRelationChange(mapping.var3, "var3");
            handleRelationChange(mapping.var4, "var4");
            handleRelationChange(mapping.var5, "var5");
        }
    }, [payload]);

    const handleNameChange = (e) => {
        setName(e.target.value);
    }

    const jsonStringToObj = (jsonString) => {
        try {
            const responseObj = JSON.parse(jsonString);
            return responseObj;
        } catch {
            return false;
        }
    }

    const getDinamicValue = (path) => {
        const keys = path.split(".");
        let value = jsonStringToObj(payload);

        for (let i = 0; i < keys.length; i++) {
            if (value === undefined) {
                return "";
            }

            if (Array.isArray(value)) {
                let array = [];
                
                for (const item of value) {
                    array.push(item[keys[i]]);
                }

                value = array;
            } else {
                value = value[keys[i]];
            }
        }

        return value ? value : "";
    }

    const getRelationValue = (newValue) => {
        let value = newValue;

        while (value.match(/\{{(.*?)\}}/)) {
            const param = value.match(/\{{(.*?)\}}/);

            const dinamicValue = getDinamicValue(param[1].trim());

            value = value.replace(param[0], dinamicValue);
        }

        return value;
    }

    const handleRelationChange = (newValue, relation) => {
        const value = getRelationValue(newValue);

        setMapping(prev => {
            return { ...prev, [relation]: newValue }
        });

        setMappingValues(prev => {
            return { ...prev, [relation]: value }
        });
    }

    const handleConnectionTypeChange = (e) => {
		setConnectionType(e.target.value);
        setConnections([]);
	}
    
    const handleTemplateChange = (e) => {
		setTemplate(e.target.value);
	}

    const handleConnectionChange = (e) => {
		const value = e.target.value;
        const allIndex = value.indexOf('Todos');

		if (allIndex !== -1 && allIndex === (value.length - 1)) {
			setConnections([]);

			const allConnections = ["Todos"]

			setConnections(allConnections);
			setOpenConnectionSelect(false);
		} else {
            if ((allIndex || allIndex === 0) && allIndex !== -1) {
				value.splice(allIndex, 1);
			}
			setConnections(typeof value === "string" ? value.split(",") : value);
		}
	}

	const handleOpenConnectionSelect = () => {
		setOpenConnectionSelect(true)
	};

	const handleCloseConnectionSelect = () => {
		setOpenConnectionSelect(false)
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="md"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{ exposedImportId
                     ? `${i18n.t("exposedImports.modal.edit")}`
                     : `${i18n.t("exposedImports.modal.create")}`
                    }
				</DialogTitle>
				<DialogContent dividers>
                    <div>
                        <TextField
                            as={TextField}
                            label={i18n.t("exposedImports.modal.name")}
                            value={name}
                            name="name"
                            onChange={(e) => { handleNameChange(e) }}
                            variant="outlined"
                            margin="dense"
                            fullWidth
                        />
                    </div>
                    { useConnectionType &&
                        <>
                            <FormControl
                                variant="outlined"
                                margin="normal"
                                fullWidth
                            >
                                <InputLabel id="connection-type-select-label">
                                    Tipo de Disparo
                                </InputLabel>
                                <Select
                                    labelId="connection-type-select-label"
                                    id="connection-type-select"
                                    value={connectionType}
                                    label="Tipo de Disparo"
                                    onChange={handleConnectionTypeChange}
                                    style={{width: "100%"}}
                                    variant="outlined"
                                >
                                    <MenuItem value={true}>{i18n.t('importModal.form.official')}</MenuItem>
                                    <MenuItem value={false}>{i18n.t('importModal.form.notOfficial')}</MenuItem>
                                </Select>
                            </FormControl>
                        </>
                    }
                    <FormControl
                        variant="outlined"
                        margin="normal"
                        fullWidth
                    >
                        <InputLabel id="connection-select-label">
                            Conexões
                        </InputLabel>
                        <Select
                            variant="outlined"
                            labelId="connection-select-label"
                            id="connection-select"
                            value={connections}
                            label="Conexões"
                            onChange={handleConnectionChange}
                            multiple
                            open={openConnectionSelect}
                            onOpen={handleOpenConnectionSelect}
                            onClose={handleCloseConnectionSelect}
                            style={{width: "100%"}}
                        >
                            <MenuItem value={"Todos"}>{i18n.t('importModal.form.all')}</MenuItem>
                            {whatsApps && whatsApps.map((whats, index) => {
                                if (whats.official === connectionType) {
                                    if (connectionType === false && whats.status === "CONNECTED") {
                                        return (
                                            <MenuItem key={index} value={whats.id}>{whats.name}</MenuItem>
                                        )
                                    } else if (connectionType === true) {
                                        return (
                                            <MenuItem key={index} value={whats.id}>{whats.name}</MenuItem>
                                        )
                                    }
                                } return null
                            })}
                        </Select>
                    </FormControl>
                    { connectionType === false &&
                        <>
                            <FormControl
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            >
                                <InputLabel id="template-select-label">
                                    Template
                                </InputLabel>
                                <Select
                                    variant="outlined"
                                    labelId="template-select-label"
                                    id="template-selec"
                                    value={template}
                                    label="Template"
                                    onChange={(e) => { handleTemplateChange(e) }}
                                    style={{width: "100%"}}
                                >
                                    <MenuItem value={"Nenhum"}>{i18n.t('importModal.form.none')}</MenuItem>
                                    {templates.length > 0 && templates.map((template, index) => {
                                        return (
                                            <MenuItem key={index} value={template.id}>{template.name}</MenuItem>
                                        )
                                    })}
                                </Select>
                            </FormControl>
                        </>
                    }
                    { exposedImportId &&
                        <>
                            <div>
                                <TextField
                                    as={TextField}
                                    label="URL"
                                    value={`${process.env.REACT_APP_BACKEND_URL}exposedImports/${exposedImportId}`}
                                    name="url"
                                    variant="outlined"
                                    margin="dense"
                                    onChange={() => {}}
                                    fullWidth
                                />
                            </div>
                            <div>
                                <TextField
                                    as={TextField}
                                    label="Header"
                                    name="header"
                                    value={JSON.stringify({"Authorization": `Bearer ${token}`}, null, 2)}
                                    multiline
                                    minRows={3}
                                    maxLength="1024"
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    onChange={() => {}}
                                />
                            </div>
                        </>
                    }
                    <Paper
                        variant="outlined"
                        style={{ marginTop: "10px" }}
                    >
                        <Typography
                            style={{
                                margin: "10px",
                                marginBottom: "0px"
                            }}
                        >
                            {i18n.t("exposedImports.modal.relations")}
                        </Typography>
                        <div>
                            <div
                                style={{
                                    margin: "10px",
                                    marginTop: "0px"
                                }}
                            >
                                <TextField
                                    as={TextField}
                                    label="Payload"
                                    name="payload"
                                    value={payload}
                                    multiline
                                    minRows={3}
                                    maxRows={10}
                                    maxLength="1024"
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    placeholder={i18n.t("exposedImports.modal.pastePayload")}
                                    onChange={(e) => { setPayload(e.target.value) }}
                                />
                            </div>
                            <Typography
                                style={{
                                    margin: "10px",
                                    marginBottom: "0px"
                                }}
                            >
                                {i18n.t("exposedImports.modal.tutorial")} {`{{variável}}`}
                            </Typography>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 5px 5px 10px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Name"
                                        value={mappingValues.name}
                                        name="name"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        disabled
                                    />
                                </div>
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 10px 5px 5px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Name Relation"
                                        value={mapping.name}
                                        name="nameRelation"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        onChange={(e) => { handleRelationChange(e.target.value, "name") }}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 5px 5px 10px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Phone Number"
                                        value={mappingValues.phoneNumber}
                                        name="phoneNumber"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        disabled
                                    />
                                </div>
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 10px 5px 5px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Phone Number Relation"
                                        value={mapping.phoneNumber}
                                        name="phoneNumberRelation"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        onChange={(e) => { handleRelationChange(e.target.value, "phoneNumber") }}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 5px 5px 10px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Document Number"
                                        value={mappingValues.documentNumber}
                                        name="documentNumber"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        disabled
                                    />
                                </div>
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 10px 5px 5px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Document Number Relation"
                                        value={mapping.documentNumber}
                                        name="documentNumberRelation"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        onChange={(e) => { handleRelationChange(e.target.value, "documentNumber") }}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 5px 5px 10px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Template"
                                        value={mappingValues.template}
                                        name="template"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        disabled
                                    />
                                </div>
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 10px 5px 5px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Template Relation"
                                        value={mapping.template}
                                        name="templateRelation"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        onChange={(e) => { handleRelationChange(e.target.value, "template") }}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 5px 5px 10px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Template Params"
                                        value={mappingValues.templateParams}
                                        name="templateParams"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        disabled
                                    />
                                </div>
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 10px 5px 5px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Template Params Relation"
                                        value={mapping.templateParams}
                                        name="templateParamsRelation"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        onChange={(e) => { handleRelationChange(e.target.value, "templateParams") }}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 5px 5px 10px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Message"
                                        value={mappingValues.message}
                                        name="message"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        disabled
                                    />
                                </div>
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 10px 5px 5px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Message Relation"
                                        value={mapping.message}
                                        name="messageRelation"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        onChange={(e) => { handleRelationChange(e.target.value, "message") }}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 5px 5px 10px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Var 1"
                                        value={mappingValues.var1}
                                        name="var1"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        disabled
                                    />
                                </div>
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 10px 5px 5px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Var 1 Relation"
                                        value={mapping.var1}
                                        name="var1Relation"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        onChange={(e) => { handleRelationChange(e.target.value, "var1") }}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 5px 5px 10px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Var 2"
                                        value={mappingValues.var2}
                                        name="var2"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        disabled
                                    />
                                </div>
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 10px 5px 5px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Var 2 Relation"
                                        value={mapping.var2}
                                        name="var2Relation"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        onChange={(e) => { handleRelationChange(e.target.value, "var2") }}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 5px 5px 10px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Var 3"
                                        value={mappingValues.var3}
                                        name="var3"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        disabled
                                    />
                                </div>
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 10px 5px 5px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Var 3 Relation"
                                        value={mapping.var3}
                                        name="var3Relation"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        onChange={(e) => { handleRelationChange(e.target.value, "var3") }}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 5px 5px 10px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Var 4"
                                        value={mappingValues.var4}
                                        name="var4"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        disabled
                                    />
                                </div>
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 10px 5px 5px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Var 4 Relation"
                                        value={mapping.var4}
                                        name="var4Relation"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        onChange={(e) => { handleRelationChange(e.target.value, "var4") }}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 5px 5px 10px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Var 5"
                                        value={mappingValues.var5}
                                        name="var5"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        disabled
                                    />
                                </div>
                                <div
                                    style={{
                                        width: "50%",
                                        margin: "0 10px 5px 5px",
                                    }}
                                >
                                    <TextField
                                        as={TextField}
                                        label="Var 5 Relation"
                                        value={mapping.var5}
                                        name="var5Relation"
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        onChange={(e) => { handleRelationChange(e.target.value, "var5") }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Paper>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						Cancelar
					</Button>
					<Button
                        onClick={handleSubmit}
						color="primary"
						variant="contained"
					>
						{ exposedImportId
                         ? `${i18n.t("exposedImports.modal.save")}`
                         : `${i18n.t("exposedImports.modal.create")}`
                        }
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ExposedImportModal;
