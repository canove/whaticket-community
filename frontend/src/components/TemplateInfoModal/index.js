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
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

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
  }
  const [template, setTemplate] = useState(initialTemplate);
  const [templateStatuses, setTemplateStatuses] = useState([]);

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
          mapping: Object.keys(JSON.parse(data.mapping)).length > 0 ? JSON.parse(data.mapping) : null
        }));

        setTemplateStatuses(data.officialTemplatesStatus);
      } catch (err) {
        toastError(err);
      }
    }

    fetchTemplate();
  }, [open, templateId]);

  const handleClose = () => {
    setTemplate(initialTemplate);
    setTemplateStatuses([]);
    onClose();
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
          { templateStatuses.length > 0 &&
            <div style={{ border: "1px solid rgba(0, 0, 0, 0.3)", borderRadius: "5px", padding: "5px", margin: "10px 0"}}>
              <Typography style={{ fontWeight: "bold" }}>
                Números com esse template:
              </Typography>
              { templateStatuses.map(templateStatus => {
                const whats = templateStatus.whatsapp ? templateStatus.whatsapp.name : null;
                if (!whats) return null;

                return (
                  <Typography key={templateStatus.id}>
                    - {whats}
                  </Typography>
                )
              })}
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
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TemplateInfoModal;
