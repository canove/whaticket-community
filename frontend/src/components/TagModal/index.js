import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import makeStyles from '@mui/styles/makeStyles';
import { green } from "@mui/material/colors";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";

import { i18n } from "../../translate/i18n";

import * as TagService from "../../services/tags";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import { IconButton, InputAdornment } from "@mui/material";
import { Colorize } from "@mui/icons-material";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
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
	colorAdorment: {
		width: 20,
		height: 20,
	},
}));

const TagSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Muito curto!")
		.max(50, "Muito longo!")
		.required("Obrigatório"),
	color: Yup.string().min(3, "Muito curto!").max(9, "Muito longo!").required("Obrigatório"),
	description: Yup.string(),
});

const TagModal = ({ open, onClose, tagId }) => {
	const classes = useStyles();

	const initialState = {
		name: "",
		color: "#3f51b5",
		description: "",
	};

	const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
	const [tag, setTag] = useState(initialState);
	const descriptionRef = useRef();

	useEffect(() => {
		if (!tagId) return;
		
		(async () => {
			try {
				// Como não temos um show específico, vamos buscar na lista
				// Em um cenário real, seria melhor ter um endpoint /tags/:id
				setTag(prevState => {
					return { ...prevState };
				});
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
			setTag(initialState);
		};
	}, [tagId, open]);

	const handleClose = () => {
		onClose();
		setTag(initialState);
	};

	const handleSaveTag = async values => {
		try {
			if (tagId) {
				await TagService.update(tagId, values);
				toast.success("Tag editada com sucesso!");
			} else {
				await TagService.create(values);
				toast.success("Tag criada com sucesso!");
			}
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleClose} scroll="paper">
				<DialogTitle>
					{tagId
						? "Editar Tag"
						: "Adicionar Tag"}
				</DialogTitle>
				<Formik
					initialValues={tag}
					enableReinitialize={true}
					validationSchema={TagSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveTag(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values }) => (
						<Form>
							<DialogContent dividers>
								<Field
									as={TextField}
									label="Nome da Tag"
									autoFocus
									name="name"
									error={touched.name && Boolean(errors.name)}
									helperText={touched.name && errors.name}
									variant="outlined"
									margin="dense"
									className={classes.textField}
								/>
								<Field
									as={TextField}
									label="Cor"
									name="color"
									id="color"
									onFocus={() => {
										setColorPickerModalOpen(true);
										descriptionRef.current.focus();
									}}
									error={touched.color && Boolean(errors.color)}
									helperText={touched.color && errors.color}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<div
													style={{ backgroundColor: values.color }}
													className={classes.colorAdorment}
												></div>
											</InputAdornment>
										),
										endAdornment: (
											<IconButton
												size="small"
												color="default"
												onClick={() => setColorPickerModalOpen(true)}
											>
												<Colorize />
											</IconButton>
										),
									}}
									variant="outlined"
									margin="dense"
								/>
								<ColorPicker
									open={colorPickerModalOpen}
									handleClose={() => setColorPickerModalOpen(false)}
									onChange={color => {
										values.color = color;
										setTag(() => {
											return { ...values, color };
										});
									}}
								/>
								<div>
									<Field
										as={TextField}
										label="Descrição"
										type="description"
										multiline
										inputRef={descriptionRef}
										rows={3}
										fullWidth
										name="description"
										error={
											touched.description && Boolean(errors.description)
										}
										helperText={
											touched.description && errors.description
										}
										variant="outlined"
										margin="dense"
									/>
								</div>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{tagId
										? "Salvar"
										: "Adicionar"}
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default TagModal;