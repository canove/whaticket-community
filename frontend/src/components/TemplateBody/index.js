import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Select,
	InputLabel,
	MenuItem,
	FormControl,
	TextField,
} from '@material-ui/core';

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input/input'

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},

	multFieldLine: {
        display: "flex",
        marginTop: 10,
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
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

const TemplateBody = ({ open, onClose, body, index, handleBodiesChange }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

    const [type, setType] = useState("");
    const [text, setText] = useState("");
    const [contactName, setContactName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [audio, setAudio] = useState("");
    const [video, setVideo] = useState("");
    const [image, setImage] = useState("");
    const [file, setFile] = useState("");
    const [fileUrl, setFileUrl] = useState("");

    const [param, setParam] = useState("");
    const [paramsQuantity, setParamsQuantity] = useState(0);
    const [openParamModal, setOpenParamModal] = useState(false);

    const [disableButton, setDisableButton] = useState(false);

    useEffect(() => {
        if (body) {
            setType(body.type);

            if (body.type === "text") {
                setText(body.value);
            }

            if (body.type === "contact") {
                setPhoneNumber(body.value);
                setContactName(body.name);
            }

            if (body.type === "audio") {
                setAudio(body.value);
            }

            if (body.type === "video") {
                setVideo(body.value);
            }

            if (body.type === "image") {
                setImage(body.value);
            }

            if (body.type === "file") {
                setFile(body.value);
            }

            if (body.type === "fileUrl") {
                setFileUrl(body.value);
            }
        }
    }, [open, body])

	const handleClose = () => {
		onClose();
        setType("");
        setText("");
        setContactName("");
        setPhoneNumber("");
        setFile("");
        setAudio("");
        setVideo("");
        setImage("");
        setFileUrl("");
        setDisableButton(false);

        setOpenParamModal(false);
        setParamsQuantity(0);
	};

	const handleSubmit = async () => {
        if (type === "text") {
            const bodyData = {
                type,
                value: text
            }

            handleBodiesChange(bodyData, index);
        }

        if (type === "contact") {
            const bodyData = {
                type,
                value: phoneNumber,
                name: contactName
            }

            handleBodiesChange(bodyData, index);
        }

        if (type === "audio") {
            const bodyData = {
                type,
                value: audio
            }

            handleBodiesChange(bodyData, index);
        }

        if (type === "video") {
            const bodyData = {
                type,
                value: video
            }

            handleBodiesChange(bodyData, index);
        }

        if (type === "image") {
            const bodyData = {
                type,
                value: image
            }

            handleBodiesChange(bodyData, index);
        }

        if (type === "file") {
            const bodyData = {
                type,
                value: file
            }

            handleBodiesChange(bodyData, index);
        }

        if (type === "fileUrl") {
            const bodyData = {
                type,
                value: fileUrl
            }

            handleBodiesChange(bodyData, index);
        }

		handleClose();
	};

    const handleTypeChange = (e) => {
        setType(e.target.value);
    }

    const handleTextChange = (e) => {
        setText(e.target.value);
    }

    const handleContactNameChange = (e) => {
        setContactName(e.target.value);
    }

    const handlePhoneNumberChange = (value) => {
        setPhoneNumber(value);
    }

    const handleAudioChange = (e) => {
		setAudio(e.target.files[0]);
    }

    const handleVideoChange = (e) => {
		setVideo(e.target.files[0]);
    }

    const handleImageChange = (e) => {
		setImage(e.target.files[0]);
    }

    const handleFileChange = (e) => {
		setFile(e.target.files[0]);
    }

    const handleFileUrlChange = (e) => {
        setFileUrl(e.target.value);
    }

    const handleParams = () => {
        if (paramsQuantity >= 3) {
             toast.error(i18n.t("templatesData.modalConfirm.exceeded"));
        } else {
             setText(prevText => prevText + "{{" + param + "}}")
        }

        handleCloseParamModal();
    };

    const handleChangeParam = (e) => {
        setParam(e.target.value)
    };

    const handleOpenParamModal = () => {
        setOpenParamModal(true);
    };

    const handleCloseParamModal = () => {
        setParam("");
        setOpenParamModal(false);
    };

    useEffect(() => {
        const testParams = () => {
            let result = 0;
            result += text.split("{{name}}").length - 1
            result += text.split("{{documentNumber}}").length - 1
            result += text.split("{{phoneNumber}}").length - 1
            result += text.split("{{var1}}").length - 1
            result += text.split("{{var2}}").length - 1
            result += text.split("{{var3}}").length - 1
            result += text.split("{{var4}}").length - 1
            result += text.split("{{var5}}").length - 1

            setParamsQuantity(result);
        }
        testParams();
    }, [text])

    useEffect(() => {
        if (type === "text") {
            if (paramsQuantity > 3) {
                toast.error(i18n.t("templatesData.modalConfirm.exceeded"));
                setDisableButton(true);
            } else {
                setDisableButton(false);
            }
        } else if (type === "video") {
            if (video.size > 10000000) {
                toast.error(i18n.t("templatesData.modalConfirm.videoExceeded"));
                setDisableButton(true);
            } else {
                setDisableButton(false);
            }
        } else {
            setDisableButton(false);
        }
// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, paramsQuantity, video])

	return (
		<div className={classes.root}>
            <div>
                <Dialog open={openParamModal} onClose={handleCloseParamModal}>
                <DialogTitle>{i18n.t("templatesData.modal.selectVar")}</DialogTitle>
                <DialogContent>
                    <FormControl className={classes.multFieldLine}>
                    <Select
                        variant="outlined"
                        id="demo-dialog-select"
                        value={param}
                        onChange={handleChangeParam}
                        style={{width: "100%"}}
                    >
                        <MenuItem value={'name'}>{i18n.t("templatesData.modal.name")}</MenuItem>
                        <MenuItem value={'documentNumber'}>{i18n.t("templatesData.modal.document")}</MenuItem>
                        <MenuItem value={'phoneNumber'}>{i18n.t("templatesData.modal.phoneNumber")}</MenuItem>
                        <MenuItem value={'var1'}>Var 1</MenuItem>
                        <MenuItem value={'var2'}>Var 2</MenuItem>
                        <MenuItem value={'var3'}>Var 3</MenuItem>
                        <MenuItem value={'var4'}>Var 4</MenuItem>
                        <MenuItem value={'var5'}>Var 5</MenuItem>
                    </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseParamModal} color="primary">
                    {i18n.t("templatesData.modal.cancel")}
                    </Button>
                    <Button onClick={handleParams} color="primary">
                    {i18n.t("templatesData.modal.ok")}
                    </Button>
                </DialogActions>
                </Dialog>
            </div>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{ body
                     ? `${i18n.t("templatesData.modal.edited")}`
                     : `${i18n.t("templatesData.modal.created")}`
                    }
				</DialogTitle>
				<DialogContent dividers>
					<div className={classes.root}>
						<FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<InputLabel id="type-select-label">
								{i18n.t("templatesData.modal.type")}
							</InputLabel>
							<Select
								labelId="type-select-label"
								label={i18n.t("templatesData.modal.type")}
								id="type-select"
								value={type}
								onChange={(e) => { handleTypeChange(e) }}
								fullWidth
							>
								<MenuItem value={"text"}>{i18n.t("templatesData.modal.text")}</MenuItem>
                                <MenuItem value={"audio"}>{i18n.t("templatesData.modal.audio")}</MenuItem>
                                <MenuItem value={"video"}>{i18n.t("templatesData.modal.movie")}</MenuItem>
                                <MenuItem value={"image"}>{i18n.t("templatesData.modal.image")}</MenuItem>
                                <MenuItem value={"contact"}>{i18n.t("templatesData.modal.contact")}</MenuItem>
                                <MenuItem value={"file"}>{i18n.t("templatesData.modal.file")}</MenuItem>
                                <MenuItem value={"fileUrl"}>Arquivo URL</MenuItem>
							</Select>
						</FormControl>
                    </div>
                    { type === "text" &&
                        <div className={classes.root}>
                            <FormControl
                                variant="outlined"
                                margin="dense"
                                fullWidth
						    >
                                <TextField
                                    label={i18n.t("templatesData.modal.text")}
                                    variant="outlined"
                                    value={text}
                                    onChange={handleTextChange}
                                    fullWidth
                                />
						    </FormControl>
                        </div>
                    }
                    { type === "contact" &&
                        // <div className={classes.root}>
                        //     <FormControl
						// 	variant="outlined"
						// 	margin="dense"
						// 	fullWidth
						//     >
                        //         <TextField
                        //             label="Número de Telefone"
                        //             placeholder="(00) 0000-0000"
                        //             variant="outlined"
                        //             value={phoneNumber}
                        //             onChange={handlePhoneNumberChange}
                        //             fullWidth
                        //         />
						//     </FormControl>
                        // </div>
                        <div className={classes.root}>
                            <FormControl
                                variant="outlined"
                                margin="dense"
                                fullWidth
						    >
                                <TextField
                                    label={i18n.t("templatesData.modal.nameContact")}
                                    variant="outlined"
                                    value={contactName}
                                    onChange={handleContactNameChange}
                                    fullWidth
                                />
						    </FormControl>
                            <FormControl
                                variant="outlined"
                                margin="dense"
                                fullWidth
                            >
                                <PhoneInput
                                    style={{ width:"100%", padding:"10px", fontSize:"16px" }}
                                    country="BR"
                                    placeholder="(00) 0000-0000"
                                    value={phoneNumber}
                                    onChange={handlePhoneNumberChange}
                                />
                            </FormControl>
                        </div>
                    }
                    { type === "audio" &&
                        <div className={classes.multFieldLine}>
                            <TextField
                                label={i18n.t("templatesData.modal.file")}
                                variant="outlined"
                                value={audio ? audio.name || audio : ""}
                                fullWidth
                                disabled
                            />
                            <Button
                                variant="contained"
                                component="label"
                            >
                                {i18n.t("templatesData.modal.load")}
                                <input
                                    type="file"
                                    onChange={handleAudioChange}
                                    hidden
                                    accept="audio/*"
                                />
                            </Button>
                        </div>
                    }
                    { type === "video" &&
                        <div className={classes.multFieldLine}>
                            <TextField
                                label={i18n.t("templatesData.modal.file")}
                                variant="outlined"
                                value={video ? video.name || video : ""}
                                fullWidth
                                disabled
                            />
                            <Button
                                variant="contained"
                                component="label"
                            >
                                {i18n.t("templatesData.modal.load")}
                                <input
                                    type="file"
                                    onChange={handleVideoChange}
                                    hidden
                                    accept="video/*"
                                />
                            </Button>
                        </div>
                    }
                    { type === "image" &&
                        <div className={classes.multFieldLine}>
                            <TextField
                                label={i18n.t("templatesData.modal.file")}
                                variant="outlined"
                                value={image ? image.name || image : ""}
                                fullWidth
                                disabled
                            />
                            <Button
                                variant="contained"
                                component="label"
                            >
                                {i18n.t("templatesData.modal.load")}
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    hidden
                                    accept="image/*"
                                />
                            </Button>
                        </div>
                    }
                    { type === "file" &&
                        <div className={classes.multFieldLine}>
                            <TextField
                                label={i18n.t("templatesData.modal.file")}
                                variant="outlined"
                                value={file ? file.name || file : ""}
                                fullWidth
                                disabled
                            />
                            <Button
                                variant="contained"
                                component="label"
                            >
                                {i18n.t("templatesData.modal.load")}
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    hidden
                                    accept=".pdf, .xls, .xlsx, .csv, .txt, .doc, .docx, .ppt, .rar, .zip"
                                />
                            </Button>
                        </div>
                    }
                    { type === "fileUrl" &&
                        <div className={classes.root}>
                            <FormControl
                                variant="outlined"
                                margin="dense"
                                fullWidth
						    >
                                <TextField
                                    label="Arquivo URL"
                                    variant="outlined"
                                    value={fileUrl}
                                    onChange={handleFileUrlChange}
                                    fullWidth
                                />
						    </FormControl>
                        </div>
                    }
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						{i18n.t("templatesData.modal.cancel")}
					</Button>
                    { type === "text" &&
                        <Button
                            color="primary"
                            variant="contained"
                            className={classes.btnWrapper}
                            onClick={handleOpenParamModal}
                        >
                            {"{{ }}"}
                        </Button>
                    }
					<Button
                        onClick={handleSubmit}
						color="primary"
						variant="contained"
                        disabled={disableButton}
					>
						{ body
                         ? `${i18n.t("templatesData.modal.edited")}`
                         : `${i18n.t("templatesData.modal.created")}`
                        }
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default TemplateBody;