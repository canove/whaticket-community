import React, { useState, useContext, useEffect } from "react";
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
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tooltip,
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ParamsSelect from "../ParamsSelect";

const useStyles = makeStyles(() => ({
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
}));

const paramTypes = [
  {
    name: "Nome",
    value: "name"
  },
  {
    name: "CPF",
    value: "documentNumber"
  },
  {
    name: "Telefone",
    value: "phoneNumber"
  },
  {
    name: "Var 1",
    value: "var1"
  },
  {
    name: "Var 2",
    value: "var2"
  },
  {
    name: "Var 3",
    value: "var3"
  },
  {
    name: "Var 4",
    value: "var4"
  },
  {
    name: "Var 5",
    value: "var5"
  },
  {
    name: "Custom Param",
    value: "custom"
  }
];

const TemplateInfoModal = ({ open, onClose, templateId }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();

  const initialTemplate = {
    name: "",
    category: "",
    header: null, 
    body: "",
    mapping: null, 
    footer: "",
    buttons: []
  }
  const [template, setTemplate] = useState(initialTemplate);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return;

      try {
        const { data } = await api.get(`/whatsappTemplate/show/${templateId}`);
        setTemplate(prevTemplate => ({
          ...prevTemplate,
          name: data.name,
          category: data.category,
          body: data.body,
          footer: data.footer,
          header: data.header ? JSON.parse(data.header) : null,
          buttons: data.buttons ? JSON.parse(data.buttons) : [],
          mapping: Object.keys(JSON.parse(data.mapping)).length > 0 ? JSON.parse(data.mapping) : null
        }));
      } catch (err) {
        toastError(err);
      }
    }

    fetchTemplate();
  }, [open, templateId]);

  const handleClose = () => {
    setTemplate(initialTemplate);
    onClose();
  }

  const handleSubmit = async () => {
    const body = {
      ...template,
      header: template.header ? JSON.stringify(template.header) : null,
      mapping: template.mapping ? JSON.stringify(template.mapping) : JSON.stringify({}),
    }

    try {
      await api.put(`/whatsappTemplate/${templateId}`, body);
      toast.success("Template atualizado com sucesso!");
      handleClose();
    } catch (err) {
      toastError(err);
    }
  }

  const handleHeaderChange = (e, param) => {
    const value = e.target.value;

    setTemplate(prevTemplate => {
      const newHeader = {
        ...prevTemplate.header,
        [param]: value
      }

      return ({
        ...prevTemplate,
        header: newHeader
      })
    });
  }

  const handleMappingChange = (e, param) => {
    const value = e.target.value;

    setTemplate(prevTemplate => {
      const newMapping = {
        ...prevTemplate.mapping,
        [param]: value
      }

      return ({
        ...prevTemplate,
        mapping: newMapping
      })
    });
  }

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>Template</DialogTitle>
        <DialogContent dividers>
          { template.header &&
            <div style={{ border: "2px solid red", borderRadius: "5px", padding: "5px", margin: "10px 0"}}>
              <Typography style={{ fontWeight: "bold" }}>
                Para templates com arquivo (header), é necessário adicionar um arquivo de exemplo diretamente no site da META.
              </Typography>
            </div>
          }
          <div className={classes.multFieldLine}>
            <TextField
              label={i18n.t("templates.templateModal.name")}
              value={template.name}
              variant="outlined"
              margin="dense"
              fullWidth
              className={classes.textField}
              disabled={true}
            />
          </div>
          { template.header &&
            <div>
              { Object.keys(template.header).map(key => {
                const item = template.header[key];

                return (
                  <ParamsSelect
                    key={key}
                    param={key}
                    value={item}
                    onChange={handleHeaderChange}
                  />
                )
              })}
            </div>
          }
          { template.header && 
            <div style={{ border: "1px solid rgba(0, 0, 0, 0.3)", borderRadius: "5px", padding: "5px", margin: "10px 0"}}>
              <Typography style={{ fontWeight: "bold" }}>
                Variáveis do Arquivo:
              </Typography>
              { Object.keys(template.header).map(key => {
                const item = template.header[key];

                return (
                  <Typography key={key}>
                    {key}: {item}
                  </Typography>
                )
              })}
            </div>
          }
          <div className={classes.multFieldLine}>
            <TextField
              label={i18n.t("templates.templateModal.body")}
              value={template.body}
              variant="outlined"
              margin="dense"
              fullWidth
              multiline
              minRows={5}
              className={classes.textField}
              disabled={true}
            />
          </div>
          
          { template.mapping && 
            <div>
              { Object.keys(template.mapping).map(key => {
                const item = template.mapping[key];

                return (
                  <ParamsSelect
                    key={key}
                    param={key}
                    value={item}
                    onChange={handleMappingChange}
                  />
                )
              })}
            </div>
          }
          { template.mapping && 
            <div style={{ border: "1px solid rgba(0, 0, 0, 0.3)", borderRadius: "5px", padding: "5px", margin: "10px 0"}}>
              <Typography style={{ fontWeight: "bold" }}>
                Variáveis da Mensagem:
              </Typography>
              { Object.keys(template.mapping).map(key => {
                const item = template.mapping[key];

                return (
                  <Typography key={key}>
                    {key}: {item}
                  </Typography>
                )
              })}
            </div>
          }
          { template.footer && 
            <div className={classes.multFieldLine}>
              <TextField
                label={i18n.t("templates.templateModal.footer")}
                value={template.footer}
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                minRows={2}
                className={classes.textField}
                disabled={true}
              />
            </div>
          }
          {template.buttons.length > 0 &&
            <div style={{ border: "1px solid rgba(0, 0, 0, 0.5)", borderRadius: "5px", padding: "8px", marginTop: "8px" }}>
              <Typography style={{ fontWeight: "bold" }}>Botões: </Typography>
              { template.buttons.map((button, index) => (
                <Tooltip title={button.type} key={index}>
                  <Button
                    variant="outlined"
                    fullWidth
                  >
                    {button.text}
                  </Button>
                </Tooltip>
              )) }
            </div>
          }
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            variant="outlined"
          >
            {i18n.t("templates.buttons.cancel")}
          </Button>
          { (template.mapping || template.header) &&
            <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
            >
              {"Salvar"}
            </Button>
          }
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TemplateInfoModal;
