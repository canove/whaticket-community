import React, { useState, useEffect } from "react";
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

const ImportationtModal = ({ open, onClose, integratedImportId }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [name, setName] = useState("");
    const [method, setMethod] = useState("");
    const [url, setUrl] = useState("");
    const [key, setKey] = useState("");
    const [token, setToken] = useState("");
    const [config, setConfig] = useState("");
    const [body, setBody] = useState("");
    const [response, setResponse] = useState("");

    const [relationName, setRelationName] = useState("");
    const [relationDocumentNumber, setRelationDocumentNumber] = useState("");
    const [relationTemplate, setRelationTemplate] = useState("");

    const [nameRelation, setNameRelation] = useState("");
    const [documentNumberRelation, setDocumentNumberRelation] = useState("");
    const [templateRelation, setTemplateRelation] = useState("");

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const { data } = await api.get(`/integratedImport/${integratedImportId}`);
				setName(data.name)
                setMethod(data.method)
                setUrl(data.url)
                setKey(data.key)
                setToken(data.token)
                setConfig(data.config || "");
                setBody(data.body || "");
			} catch (err) {
				toastError(err);
			}
		}

		if (integratedImportId) {
			fetchProduct();
		}
	}, [open, integratedImportId])

    const handleClose = () => {
        setName("");
        setMethod("");
        setUrl("");
        setKey("");
        setToken("");
        setConfig("");
        setBody("");
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

    const handleConfigChange = (e) => {
        setConfig(e.target.value);
    }

    const handleBodyChange = (e) => {
        setBody(e.target.value);
    }

    const handleResponseChange = (e) => {
        
    }

    const jsonToString = (json) => {
        try {
            const responseObj = JSON.parse(json);
            return responseObj;
        } catch {
            return false;
        }
    }

    const handleNameRelationChange = (e) => {
        setNameRelation(e.target.value);

        const responseObj = jsonToString(response);
            
        if (responseObj === false) return;

        if (responseObj[e.target.value]) {
            setRelationName(JSON.stringify(responseObj[e.target.value]));
        }
    }

    const handleDocumentNumberRelationChange = (e) => {
        setDocumentNumberRelation(e.target.value);

        const responseObj = jsonToString(response);
            
        if (responseObj === false) return;

        if (responseObj[e.target.value]) {
            setRelationDocumentNumber(JSON.stringify(responseObj[e.target.value]));
        }
    }

    const handleTemplateRelationChange = (e) => {
        var string = e.target.value;
        var last2 = string.slice(-2);

        if (last2 === "..") return;

        setTemplateRelation(e.target.value);

        const responseObj = jsonToString(response);
        const relation = e.target.value.split(".");

        if (responseObj === false) return;

        const value = handleKeys(relation);

        if (value) {
            setRelationTemplate(JSON.stringify(value));
        } else {
            setRelationTemplate("NOT FOUND");
        }
    }

        // const responseObj = jsonToString(response);

        // if (responseObj) {
        //     let ARRAYNIVEL1 = [];
        //     let ARRAYNIVEL2 = [];

        //     const NIVEL0 = responseObj;
        //     console.log(NIVEL0);

        //     const NIVEL1 = NIVEL0["abilities"];
        //     console.log(NIVEL1);

        //     for (const ITEM of NIVEL1) {
        //         ARRAYNIVEL1.push(ITEM["ability"]);
        //     }
            
        //     for (const ITEM of ARRAYNIVEL1) {
        //         ARRAYNIVEL2.push(ITEM["name"]);
        //     }

        //     console.log(ARRAYNIVEL2)
        // }

    const handleKeys = (keys) => {
        let value = jsonToString(response);

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

    const handleAuthenticate = async () => {
        if (!url) {
            toast.error("Adicione uma URL");
        }

        if (method === "GET") {
            axios.get(url)
            .then(resp => {
                const responseString = JSON.stringify(resp.data, null, 2);
                setResponse(responseString);
            });
        } else {
            toast.error("Selecione um Método");
        }
    };

	const handleSubmit = async () => {
		const importData = {
            name: name,
            method: method,
            url: url,
            key: key,
            token: token,
            config: config,
            body: body
		};

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
                        label="Config"
                        type="bodyText"
                        onChange={(e) => { handleConfigChange(e) }}
                        value={config}
                        multiline
                        minRows={4}
                        maxLength="1024"
                        name="config"
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
                            />
                            <TextField
                                as={TextField}
                                name="templateParams"
                                variant="outlined"
                                margin="normal"
                                label="Template Params"
                                fullWidth
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
                            />
                            <TextField
                                as={TextField}
                                name="message"
                                variant="outlined"
                                margin="normal"
                                label="Message"
                                fullWidth
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
                            />
                            <TextField
                                as={TextField}
                                name="phoneNumber"
                                variant="outlined"
                                margin="normal"
                                label="Phone Number"
                                fullWidth
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
