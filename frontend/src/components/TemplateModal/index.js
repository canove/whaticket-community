import React, { useState, useContext } from "react";
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

const TemplateModal = ({ open, onClose }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();
  const initialState = {
    templateName: "",
    bodyText: "",
    footerText: "",
  };
  const [template, setTemplate] = useState(initialState);
  const [connectionName, setConnectionName] = useState([]);
  const { whatsApps } = useContext(WhatsAppsContext);
  const [category, setCategory] = useState("");

  const handleClose = () => {
    onClose();
    setTemplate(initialState);
	  setCategory("");
    setConnectionName([]);
  };

  const handleChange = (e) => {
    const {
      target: { value },
    } = e;
    setConnectionName(typeof value === "string" ? value.split(",") : value);
  };

  const handleSubmit = async (values) => {
    const templateData = { ...values, category: category, whatsAppsId: connectionName };
		try {
      await api.post(`/whatsappTemplate/create/`, templateData);
			toast.success(i18n.t("userModal.success"));
		} catch (err) {
			toastError(err);
		}
		handleClose();
  };

  const handleCategoryChange = (e) => {
	  setCategory(e.target.value);
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
        <DialogTitle>{i18n.t("templates.templateModal.title")}</DialogTitle>
        <Formik
          initialValues={template}
          enableReinitialize={true}
          onSubmit={(values, actions) => {
            handleSubmit(values);
            setTimeout(() => {
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, touched, errors, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("templates.templateModal.name")}
                    autoFocus
                    name="templateName"
                    error={touched.templateName && Boolean(errors.templateName)}
                    helperText={touched.templateName && errors.templateName}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    className={classes.textField}
                  />
                </div>
                <div>
                  <MainHeaderButtonsWrapper>
                    <div className={classes.root}>
                      <InputLabel id="category-select-label">
                        {i18n.t("templates.templateModal.category")}
                      </InputLabel>
                      <Select
                        labelId="category-select-label"
                        id="category-select"
                        value={category}
                        onChange={handleCategoryChange}
                        fullWidth
                      >
                        <MenuItem value={"transicional"}>{i18n.t("templates.templateModal.transactional")}</MenuItem>
                        <MenuItem value={"marketing"}>{i18n.t("templates.templateModal.marketing")}</MenuItem>
                    </Select>
                  </div>
                    <FormControl className={classes.multFieldLine}>
                      <InputLabel id="multiple-official-connections-label">
                        {i18n.t("templates.templateModal.connection")}
                      </InputLabel>
                      <Select
                        labelId="multiple-official-connections-label"
                        id="multiple-official-connections"
                        multiple
                        value={connectionName}
                        onChange={handleChange}
                      >
                        {whatsApps &&
                          whatsApps.map((whats, index) => {
                            if (whats.official === true) {
                              return (
                                <MenuItem key={index} value={whats.id}>
                                  {whats.name}
                                </MenuItem>
                              );
                            }
								return null
                          })}
                      </Select>
                    </FormControl>
                  </MainHeaderButtonsWrapper>
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("templates.templateModal.body")}
                    type="bodyText"
                    multiline
                    minRows={5}
                    fullWidth
                    maxLength="1024"
                    name="bodyText"
                    error={
                      touched.bodyText && Boolean(errors.bodyText)
                    }
                    helperText={
                      touched.bodyText && errors.bodyText
                    }
                    variant="outlined"
                    margin="dense"
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("templates.templateModal.footer")}
                    type="footerText"
                    multiline
                    minRows={2}
                    fullWidth
                    maxLength="60"
                    name="footerText"
                    error={
                      touched.footerText && Boolean(errors.footerText)
                    }
                    helperText={
                      touched.footerText && errors.footerText
                    }
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
                >
                  {"{{ }}"}
                </Button>
				        <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {i18n.t("templates.buttons.add")}
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

export default TemplateModal;
