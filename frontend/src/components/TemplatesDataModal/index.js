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
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";

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

const TemplatesDataModal = ({ open, onClose, templatesId }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();
  const initialState = {
    name: "",
    footer: "",
  };
  const [template, setTemplate] = useState(initialState);
  const [text , setText] = useState("");


  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await api.get(`/TemplatesData/show/${templatesId}`);
        setTemplate((prevState) => {
          return { ...prevState, ...data };
        });
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
    setTemplate(initialState);
  };

  const handleSubmit = async (values) => {
    const templatesData = { ...values, text };
    try {
      if (templatesId) {
        await api.put(`/TemplatesData/edit/${templatesId}`, templatesData);
      } else {
        await api.post(`/TemplatesData/create/`, templatesData);
      }
      toast.success(i18n.t("templatesData.modalConfirm.successAdd"));
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  const handleArray = (e) => {
    setText(prevText => prevText + "{{ }}")
  };

  const handleChange = (e) => {
    setText(e.target.value)
  };

  return (
    <div className={classes.root}>
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
        <Formik
          initialValues={template}
          enableReinitialize={true}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSubmit(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("templatesData.templateModal.name")}
                    autoFocus
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    className={classes.textField}
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("templatesData.templateModal.bodyText")}
                    type="text"
                    onChange={(e) => {handleChange(e)}}
                    value={text}
                    multiline
                    minRows={5}
                    fullWidth
                    maxLength="1024"
                    name="text"
                    error={touched.text && Boolean(errors.text)}
                    helperText={touched.text && errors.text}
                    variant="outlined"
                    margin="dense"
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("templatesData.templateModal.footer")}
                    type="footer"
                    multiline
                    minRows={2}
                    fullWidth
                    maxLength="60"
                    name="footer"
                    error={touched.footer && Boolean(errors.footer)}
                    helperText={touched.footer && errors.footer}
                    variant="outlined"
                    margin="dense"
                  />
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                  onClick={handleArray}
                >
                  {"{{ }}"}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                  disabled={isSubmitting}
                >
                   {templatesId
                    ? `${i18n.t("templatesData.templateModal.buttonEdit")}`
                    : `${i18n.t("templatesData.templateModal.buttonAdd")}`}
                </Button>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("templates.buttons.cancel")}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default TemplatesDataModal;
