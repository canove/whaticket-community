import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Input,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import TemplateBody from "../TemplateBody";
import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  multFieldLine: {
    display: "flex",
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

  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },

  multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
		alignItems: "center",
	},
}));

const TemplatesDataModal = ({ open, onClose, templatesId }) => {
    const { i18n } = useTranslation();
    const classes = useStyles();

    const [name, setName] = useState("");
    const [footer, setFooter] = useState("");
    const [bodies, setBodies] = useState([]);
    const [selectedBody, setSelectedBody] = useState(null);
    const [selectedBodyIndex, setSelectedBodyIndex] = useState("");
    const [bodyModalOpen, setBodyModalOpen] = useState(false);

    useEffect(() => {
      const fetchTemplates = async () => {
        try {
          const { data } = await api.get(`/TemplatesData/show/${templatesId}`);
          setName(data.name);
          setFooter(data.footer);
        } catch (err) {
          toastError(err);
        }
      };
      if (templatesId) {
        fetchTemplates();
      }
    }, [templatesId, open]);

    const handleClose = () => {
      onClose();
      setName("");
      setFooter("");
      setBodies([]);
      setSelectedBody(null);
      setBodyModalOpen(false);
    };

    const handleSubmit = async () => {
      try {
				const formData = new FormData();

				formData.set("name", name);
				formData.set("footer", footer);
      
        for (const body of bodies) {
          if (body.type === "audio" || body.type === "video" || body.type === "image") {
            formData.append("file", body.value, body.value.name);
            formData.append("types", JSON.stringify({ type: body.type, file: body.value.name }));
          }

          if (body.type === "text" || body.type === "contact") {
            formData.append("bodies", JSON.stringify(body));
          }
        }

        if (templatesId) {
				  await api.post(`/TemplatesData/create/`, formData);
        } else {
          await api.post(`/TemplatesData/create/`, formData);
        }
        toast.success(i18n.t("templatesData.modalConfirm.successAdd"));
			} catch (err) {
				toastError(err);
			}

      handleClose();
    };

    const handleOpenBodyModal = () => {
      setBodyModalOpen(true);
    }

    const handleCloseBodyModal = () => {
      setSelectedBody(null);
      setSelectedBodyIndex("");
      setBodyModalOpen(false);
    }

    const handleEditBodyModal = (body, index) => {
      setSelectedBody(body);
      setSelectedBodyIndex(index);
      setBodyModalOpen(true);
    }

    const handleNameChange = (e) => {
      setName(e.target.value);
    }

    const handleFooterChange = (e) => {
      setFooter(e.target.value);
    }
    
    const handleBodiesChange = (body, index) => {
      let array = [...bodies];
      if (index || index === 0) {
        array[index] = body;
        setBodies(array);
      } else {
        array.push(body);
        setBodies(array);
      }
    }

    // useEffect(() => {
    //   console.log(bodies);
    // }, [bodies])

  return (
    <div className={classes.root}>
      <TemplateBody
        open={bodyModalOpen}
        onClose={handleCloseBodyModal}
        aria-labelledby="form-dialog-title"
        body={selectedBody}
        index={selectedBodyIndex}
        handleBodiesChange={handleBodiesChange}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {templatesId
            ? `${i18n.t("templatesData.templateModal.buttonEdit")}`
            : `${i18n.t("templatesData.templateModal.buttonAdd")}`}
        </DialogTitle>
				<DialogContent dividers>
          <div className={classes.root}>
						<FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<TextField
								label="Nome"
								variant="outlined"
								value={name}
								onChange={handleNameChange}
								fullWidth
							/>
						</FormControl>
					</div>
          { bodies.length > 0 &&
            <Paper className={classes.mainPaper} variant="outlined">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Tipo</TableCell>
                      <TableCell align="center">Body</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <>
                      {bodies && bodies.map((body, index) => {
                        return (
                          <TableRow key={index}>
                            <TableCell align="center">{body.type}</TableCell>
                            { (body.type === "text" || body.type === "contact") &&
                              <TableCell align="center">{body.value}</TableCell>
                            }
                            { (body.type === "audio" || body.type === "video" || body.type === "image") &&
                              <TableCell align="center">{body.value.name}</TableCell>
                            }
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => handleEditBodyModal(body, index)}
                              >
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                        })}
                    </>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          }
          <div className={classes.root}>
            <Button
              color="primary"
              variant="contained"
              fullWidth
              onClick={handleOpenBodyModal}
            >
              Adicionar Body
            </Button>
          </div>
          <div className={classes.root}>
						<FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<TextField
								label="Footer"
								variant="outlined"
								value={footer}
								onChange={handleFooterChange}
								fullWidth
							/>
						</FormControl>
					</div>
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
						{ templatesId ? 'Editar' : 'Criar' }
					</Button>
				</DialogActions>
			</Dialog>
    </div>
  );
};

export default TemplatesDataModal;
