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

const ImportationtModal = ({ open, onClose, integratedImportId, integratedImportCopy }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();
    const { whatsApps } = useContext(WhatsAppsContext);

	const [name, setName] = useState("");
    const [method, setMethod] = useState("");
    const [url, setUrl] = useState("");
    const [key, setKey] = useState("");
    const [token, setToken] = useState("");
    const [header, setHeader] = useState("");
    const [body, setBody] = useState("");
    const [response, setResponse] = useState("");

    const [connectionType, setConnectionType] = useState(false);
    const [useConnectionType, setUseConnectionType] = useState(false);
    const [openConnectionSelect, setOpenConnectionSelect] = useState(false);
    const [template, setTemplate] = useState("");
    const [connection, setConnection] = useState([]);

    const [menus, setMenus] = useState([]);
    const [templates, setTemplates] = useState([]);

    const [confirmCopyModalOpen, setConfirmCopyModalOpen] = useState(false);
    const [isCopying, setIsCopying] = useState(false);

    const [relationName, setRelationName] = useState("");
    const [relationDocumentNumber, setRelationDocumentNumber] = useState("");
    const [relationTemplate, setRelationTemplate] = useState("");
    const [relationTemplateParams, setRelationTemplateParams] = useState("");
    const [relationMessage, setRelationMessage] = useState("");
    const [relationPhoneNumber, setRelationPhoneNumber] = useState("");

    const [nameRelation, setNameRelation] = useState("");
    const [documentNumberRelation, setDocumentNumberRelation] = useState("");
    const [templateRelation, setTemplateRelation] = useState("");
    const [templateParamsRelation, setTemplateParamsRelation] = useState("");
    const [messageRelation, setMessageRelation] = useState("");
    const [phoneNumberRelation, setPhoneNumberRelation] = useState("");

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const { data } = await api.get(`/integratedImport/${integratedImportId}`);
				setName(data.name)
                setMethod(data.method)
                setUrl(data.url)
                setKey(data.key)
                setToken(data.token)
                setHeader(data.header || "");
                setBody(data.body || "");

                setConnectionType(data.official);
                setTemplate(data.templateId);
                setConnection(data.whatsappIds ? data.whatsappIds.split(",") : ["Todos"]);

                const mapping = JSON.parse(data.mapping);

                setNameRelation(mapping.name);
                setDocumentNumberRelation(mapping.documentNumber);
                setTemplateRelation(mapping.templateParams);
                setTemplateParamsRelation(mapping.templateParams);
                setMessageRelation(mapping.message);
                setPhoneNumberRelation(mapping.phoneNumber)
			} catch (err) {
				toastError(err);
			}
		}

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

		if (integratedImportId) {
			fetchProduct();
		}

        if (integratedImportCopy) {
            setIsCopying(true);

            setName(`${integratedImportCopy.name} copy`)
            setMethod(integratedImportCopy.method)
            setUrl(integratedImportCopy.url)
            setKey(integratedImportCopy.key)
            setToken(integratedImportCopy.token)
            setHeader(integratedImportCopy.header || "");
            setBody(integratedImportCopy.body || "");

            setConnectionType(integratedImportCopy.official);
            setTemplate(integratedImportCopy.templateId);
            setConnection(integratedImportCopy.whatsappIds ? integratedImportCopy.whatsappIds.split(",") : ["Todos"]);

            const mapping = JSON.parse(integratedImportCopy.mapping);

            setNameRelation(mapping.name);
            setDocumentNumberRelation(mapping.documentNumber);
            setTemplateRelation(mapping.templateParams);
            setTemplateParamsRelation(mapping.templateParams);
            setMessageRelation(mapping.message);
            setPhoneNumberRelation(mapping.phoneNumber)
        }
	}, [open, integratedImportId, integratedImportCopy])

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
        setMethod("");
        setUrl("");
        setKey("");
        setToken("");
        setHeader("");
        setBody("");
        setResponse("");

        setConnectionType(false);
        setUseConnectionType(false);
        setOpenConnectionSelect(false);
        setTemplate("");
        setConnection([]);

        setIsCopying(false);
        setConfirmCopyModalOpen(false);

        setRelationName("");
        setRelationDocumentNumber("");
        setRelationTemplate("");
        setRelationTemplateParams("");
        setRelationMessage("");
        setRelationPhoneNumber("");
    
        setNameRelation("");
        setDocumentNumberRelation("");
        setTemplateRelation("");
        setTemplateParamsRelation("");
        setMessageRelation("");
        setPhoneNumberRelation("");

        onClose();
	};

	const handleNameChange = (e) => {
		setName(e.target.value);
	};

    const handleMethodChange = (e) => {
		setMethod(e.target.value);
	};

    const handleUrlChange = (e) => {
        setUrl(e.target.value);
    };

    const handleHeaderChange = (e) => {
        setHeader(e.target.value);
    }

    const handleBodyChange = (e) => {
        setBody(e.target.value);
    }

    const handleResponseChange = (e) => {
        
    }

    const handleNameRelationChange = (e) => {
        var string = e.target.value;
        var last2 = string.slice(-2);

        if (last2 === "..") return;

        setNameRelation(e.target.value);

        const responseObj = jsonStringToObj(response);
        const relation = e.target.value.split(".");

        if (responseObj === false) return;

        const value = handleKeys(relation);

        if (value) {
            setRelationName(JSON.stringify(value));
        } else {
            setRelationName("NOT FOUND");
        }
    }

    const handleDocumentNumberRelationChange = (e) => {
        var string = e.target.value;
        var last2 = string.slice(-2);

        if (last2 === "..") return;

        setDocumentNumberRelation(e.target.value);

        const responseObj = jsonStringToObj(response);
        const relation = e.target.value.split(".");

        if (responseObj === false) return;

        const value = handleKeys(relation);

        if (value) {
            setRelationDocumentNumber(JSON.stringify(value));
        } else {
            setRelationDocumentNumber("NOT FOUND");
        }
    }

    const handleTemplateRelationChange = (e) => {
        var string = e.target.value;
        var last2 = string.slice(-2);

        if (last2 === "..") return;

        setTemplateRelation(e.target.value);

        const responseObj = jsonStringToObj(response);
        const relation = e.target.value.split(".");

        if (responseObj === false) return;

        const value = handleKeys(relation);

        if (value) {
            setRelationTemplate(JSON.stringify(value));
        } else {
            setRelationTemplate("NOT FOUND");
        }
    }

    const handleTemplateParamsRelationChange = (e) => {
        var string = e.target.value;
        var last2 = string.slice(-2);

        if (last2 === "..") return;

        setTemplateParamsRelation(e.target.value);

        const responseObj = jsonStringToObj(response);
        const relation = e.target.value.split(".");

        if (responseObj === false) return;

        const value = handleKeys(relation);

        if (value) {
            setRelationTemplateParams(JSON.stringify(value));
        } else {
            setRelationTemplateParams("NOT FOUND");
        }
    }

    const handleMessageRelationChange = (e) => {
        var string = e.target.value;
        var last2 = string.slice(-2);

        if (last2 === "..") return;

        setMessageRelation(e.target.value);

        const responseObj = jsonStringToObj(response);
        const relation = e.target.value.split(".");

        if (responseObj === false) return;

        const value = handleKeys(relation);

        if (value) {
            setRelationMessage(JSON.stringify(value));
        } else {
            setRelationMessage("NOT FOUND");
        }
    }

    const handlePhoneNumberRelationChange = (e) => {
        var string = e.target.value;
        var last2 = string.slice(-2);

        if (last2 === "..") return;

        setPhoneNumberRelation(e.target.value);

        const responseObj = jsonStringToObj(response);
        const relation = e.target.value.split(".");

        if (responseObj === false) return;

        const value = handleKeys(relation);

        if (value) {
            setRelationPhoneNumber(JSON.stringify(value));
        } else {
            setRelationPhoneNumber("NOT FOUND");
        }
    }

    const handleConnectionTypeChange = (e) => {
		setConnectionType(e.target.value);
	}
    
    const handleTemplateChange = (e) => {
		setTemplate(e.target.value);
	}

    const handleConnectionChange = (e) => {
		const value = e.target.value;
        const allIndex = value.indexOf('Todos');

		if (allIndex !== -1 && allIndex === (value.length - 1)) {
			setConnection([]);

			const allConnections = ["Todos"]

			setConnection(allConnections);
			setOpenConnectionSelect(false);
		} else {
            if ((allIndex || allIndex === 0) && allIndex !== -1) {
				value.splice(allIndex, 1);
			}
			setConnection(typeof value === "string" ? value.split(",") : value);
		}
	}

	const handleOpenConnectionSelect = () => {
		setOpenConnectionSelect(true)
	};

	const handleCloseConnectionSelect = () => {
		setOpenConnectionSelect(false)
	};

    const handleKeys = (keys) => {
        let value = jsonStringToObj(response);

        if (!value) return false;

        for (let i = 0; i < keys.length; i++) {
            if (value === undefined) {
                return false;
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

        return value;
    }

    const jsonStringToObj = (json) => {
        try {
            const responseObj = JSON.parse(json);
            return responseObj;
        } catch {
            return false;
        }
    }

    const handleAuthenticate = async () => {
        if (!url) {
            toast.error("Adicione uma URL");
        }

        let headerJSON = jsonStringToObj(header);
        let bodyJSON = jsonStringToObj(body);

        if (!headerJSON) {
            headerJSON = "";
        }

        if (method === "POST" || !bodyJSON) {
            bodyJSON = "";
        }

        axios({
            method: method,
            url: url,
            headers: {
                ...headerJSON
            },
            data: {
                ...bodyJSON
            }
        })
        .then(res => {
            const responseString = JSON.stringify(res.data, null, 2);
            setResponse(responseString);
        })
        .catch(err => {
            const responseString = JSON.stringify(err, null, 2);
            setResponse(responseString);
        });
    };

	const handleSubmit = async () => {
        const mapping = {
            name: nameRelation,
            documentNumber: documentNumberRelation,
            template: templateRelation,
            templateParams: templateParamsRelation,
            message: messageRelation,
            phoneNumber: phoneNumberRelation
        }

		const importData = {
            name: name,
            method: method,
            url: url,
            key: key,
            token: token,
            header: header,
            body: body,
            mapping: JSON.stringify(mapping),
            templateId: template,
            official: connectionType,
            whatsappIds: connection ? connection.toString() : null
		};

        if (isCopying) {
            setConfirmCopyModalOpen(true);
        } else {
            try {
                if (integratedImportId) {
                    await api.put(`/integratedImport/${integratedImportId}`, importData);
                    toast.success(i18n.t("integratedImport.confirmation.updatedAt"));
                } else {
                    await api.post("/integratedImport/", importData);
                    toast.success(i18n.t("integratedImport.confirmation.createdAt"));
                }
                } catch (err) {
                    toastError(err);
            }
            handleClose();
        }
	};

    const handleCopy = async () => {
        const mapping = {
            name: nameRelation,
            documentNumber: documentNumberRelation,
            template: templateRelation,
            templateParams: templateParamsRelation,
            message: messageRelation,
            phoneNumber: phoneNumberRelation,
        }

		const importData = {
            name: name,
            method: method,
            url: url,
            key: key,
            token: token,
            header: header,
            body: body,
            mapping: JSON.stringify(mapping),
            templateId: template,
            official: connectionType,
            whatsappIds: connection.toString()
		};

        try {
            await api.post("/integratedImport/", importData);
            toast.success("Copiado com sucesso!");
        } catch (err) {
            toastError(err);
        }

        handleClose();
    }

	return (
		<div className={classes.root}>
            <ConfirmationModal
                title={'Copiar Importação'}
                open={confirmCopyModalOpen}
                onClose={setConfirmCopyModalOpen}
                onConfirm={handleCopy}
            >
                Você realmente deseja copiar está importação?
                Ao realizar está ação, dará inicio a importação dos dados para realizar os disparos, deseja prosseguir?
            </ConfirmationModal>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="md"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{ integratedImportId
                     ? `${i18n.t("integratedImport.integratedModal.edited")}`
                     : `${i18n.t("integratedImport.integratedModal.add")}`
                    }
				</DialogTitle>
				<DialogContent dividers>
				<div className={classes.multFieldLine}>
                  <TextField
					as={TextField}
                    name="name"
                    variant="outlined"
                    margin="normal"
                    label={i18n.t("integratedImport.integratedModal.name")}
                    fullWidth
					value={name}
					onChange={handleNameChange}
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
						value={connection}
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
                <div>
                    <FormControl
                        variant="outlined"
                        margin="normal"
                        fullWidth
                    >
                        <InputLabel id="method-selection-label">
                            {i18n.t("integratedImport.integratedModal.method")}
                        </InputLabel>
                        <Select
                            name="method"
                            labelId="method-selection-label"
                            id="method-selection"
                            label="Method"
                            value={method}
                            onChange={(e) => { handleMethodChange(e) }}
                        >
                            <MenuItem value="GET"> {i18n.t('GET')}</MenuItem>
                            <MenuItem value= "POST">{i18n.t('POST')}</MenuItem>
                        </Select>
                    </FormControl>
                </div>
                <div className={classes.multFieldLine}>
                  <TextField
					as={TextField}
                    name="url"
                    variant="outlined"
                    margin="normal"
                    label={i18n.t("integratedImport.integratedModal.url")}
                    fullWidth
					value={url}
					onChange={handleUrlChange}
                  />
                </div>
                { method === "POST" && 
                    <div className={classes.multFieldLine}>
                        <TextField
                            as={TextField}
                            label="Body"
                            type="bodyText"
                            onChange={(e) => { handleBodyChange(e) }}
                            value={body}
                            multiline
                            minRows={4}
                            maxLength="1024"
                            name="body"
                            variant="outlined"
                            margin="normal"
                            fullWidth
                        />
                    </div>
                }
               <Typography variant="subtitle1" gutterBottom>
					{i18n.t("integratedImport.integratedModal.autentication")}:
				</Typography>
                <div className={classes.multFieldLine}>
                    <TextField
                        as={TextField}
                        label="Header"
                        type="bodyText"
                        onChange={(e) => { handleHeaderChange(e) }}
                        value={header}
                        multiline
                        minRows={4}
                        maxLength="1024"
                        name="header"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                    />
                </div>
                <Button
                    onClick={() => { handleAuthenticate() }}
                    color="primary"
                    variant="contained"
                >
                    {i18n.t("integratedImport.integratedModal.autentic")}
                </Button>
                <div className={classes.multFieldLine}>
                    <Paper
                        className={classes.mainPaper}
                        variant="outlined"
                    >
                        <Typography>
                            Response: 
                        </Typography>
                        <TextField
                            as={TextField}
                            label={i18n.t("integratedImport.integratedModal.in")}
                            onChange={(e) => { handleResponseChange(e) }}
                            value={response}
                            type="bodyText"
                            multiline
                            minRows={8}
                            maxLength="1024"
                            name="response"
                            variant="outlined"
                            margin="normal"
                            fullWidth
                        />
                    </Paper>
                    <Paper
                        className={classes.mainPaper}
                        variant="outlined"
                    >
                        <Typography>
                            Relation: 
                        </Typography>
                        <div className={classes.multFieldLine}>
                            <TextField
                                as={TextField}
                                name="name"
                                variant="outlined"
                                margin="normal"
                                label="name"
                                fullWidth
                                disabled
                                value={relationName}
                            />
                            <TextField
                                as={TextField}
                                name="nameRelation"
                                variant="outlined"
                                margin="normal"
                                label="Name"
                                fullWidth
                                value={nameRelation}
                                onChange={(e) => { handleNameRelationChange(e) }}
                            />
                        </div>
                        <div className={classes.multFieldLine}>
                            <TextField
                                as={TextField}
                                name="documentNumber"
                                variant="outlined"
                                margin="normal"
                                label="documentNumber"
                                fullWidth
                                disabled
                                value={relationDocumentNumber}
                            />
                            <TextField
                                as={TextField}
                                name="documentNumberRelation"
                                variant="outlined"
                                margin="normal"
                                label="Document Number"
                                fullWidth
                                value={documentNumberRelation}
                                onChange={(e) => { handleDocumentNumberRelationChange(e) }}
                            />
                        </div>
                        <div className={classes.multFieldLine}>
                            <TextField
                                as={TextField}
                                name="template"
                                variant="outlined"
                                margin="normal"
                                label="template"
                                fullWidth
                                disabled
                                value={relationTemplate}
                            />
                            <TextField
                                as={TextField}
                                name="template"
                                variant="outlined"
                                margin="normal"
                                label="Template"
                                fullWidth
                                value={templateRelation}
                                onChange={(e) => { handleTemplateRelationChange(e) }}
                            />
                        </div>
                        <div className={classes.multFieldLine}>
                            <TextField
                                as={TextField}
                                name="templateParams"
                                variant="outlined"
                                margin="normal"
                                label="templateParams"
                                fullWidth
                                disabled
                                value={relationTemplateParams}
                            />
                            <TextField
                                as={TextField}
                                name="templateParams"
                                variant="outlined"
                                margin="normal"
                                label="Template Params"
                                fullWidth
                                value={templateParamsRelation}
                                onChange={(e) => { handleTemplateParamsRelationChange(e) }}
                            />
                        </div>
                        <div className={classes.multFieldLine}>
                            <TextField
                                as={TextField}
                                name="message"
                                variant="outlined"
                                margin="normal"
                                label="message"
                                fullWidth
                                disabled
                                value={relationMessage}
                            />
                            <TextField
                                as={TextField}
                                name="message"
                                variant="outlined"
                                margin="normal"
                                label="Message"
                                fullWidth
                                value={messageRelation}
                                onChange={(e) => { handleMessageRelationChange(e) }}
                            />
                        </div>
                        <div className={classes.multFieldLine}>
                            <TextField
                                as={TextField}
                                name="phoneNumber"
                                variant="outlined"
                                margin="normal"
                                label="phoneNumber"
                                fullWidth
                                disabled
                                value={relationPhoneNumber}
                            />
                            <TextField
                                as={TextField}
                                name="phoneNumber"
                                variant="outlined"
                                margin="normal"
                                label="Phone Number"
                                fullWidth
                                value={phoneNumberRelation}
                                onChange={(e) => { handlePhoneNumberRelationChange(e) }}
                            />
                        </div>
                    </Paper>
                </div>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						{i18n.t("integratedImport.integratedModal.cancel")}
					</Button>
					<Button
                        onClick={handleSubmit}
						color="primary"
						variant="contained"
					>
						{ integratedImportId
                         ? `${i18n.t("integratedImport.integratedModal.edit")}`
                         : `${i18n.t("integratedImport.integratedModal.save")}`
                        }
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ImportationtModal;
