import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import makeStyles from '@mui/styles/makeStyles';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import { Trash2 as DeleteOutlineIcon, Plus as AddIcon } from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(() => ({
  dialogTitle: {
    padding: "24px 24px 0",
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 18,
    color: "#0A0F1E",
    letterSpacing: "-0.3px",
  },

  sectionLabel: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 11,
    color: "#9BA3B0",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    margin: "0 0 10px",
  },

  section: {
    marginBottom: 20,
  },

  fieldRow: {
    display: "flex",
    gap: 16,
  },

  field: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 11,
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 14,
      "& fieldset": { borderColor: "#E5E9EF" },
      "&:hover fieldset": { borderColor: "#25D366" },
      "&.Mui-focused fieldset": { borderColor: "#25D366", borderWidth: 1.5 },
    },
    "& .MuiInputLabel-outlined": {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 14,
      color: "#9BA3B0",
    },
    "& .MuiInputLabel-outlined.Mui-focused": {
      color: "#25D366",
    },
    "& .MuiFormHelperText-root": {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 11,
    },
  },

  extraRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  addExtraBtn: {
    width: "100%",
    borderRadius: 9,
    border: "1px dashed #E5E9EF",
    color: "#9BA3B0",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",
    height: 38,
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "#F7F8FA",
      borderColor: "#25D366",
      color: "#1DAB57",
    },
  },

  deleteExtraBtn: {
    color: "#C4CDD5",
    padding: 6,
    "&:hover": {
      color: "#DC2626",
      backgroundColor: "rgba(220,38,38,0.08)",
    },
  },

  cancelBtn: {
    borderRadius: 11,
    border: "1px solid #E5E9EF",
    color: "#9BA3B0",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",
    height: 40,
    padding: "0 20px",
    backgroundColor: "transparent",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#F7F8FA",
      boxShadow: "none",
    },
  },

  saveBtn: {
    borderRadius: 11,
    background: "linear-gradient(135deg, #25D366, #1DAB57)",
    color: "#ffffff",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",
    height: 40,
    padding: "0 24px",
    boxShadow: "none",
    position: "relative",
    "&:hover": {
      background: "linear-gradient(135deg, #1DAB57, #178A45)",
      boxShadow: "none",
    },
    "&.Mui-disabled": {
      opacity: 0.7,
      color: "#ffffff",
    },
  },

  buttonProgress: {
    color: "#25D366",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  number: Yup.string().min(8, "Too Short!").max(50, "Too Long!"),
  email: Yup.string().email("Invalid email"),
});

const ContactModal = ({ open, onClose, contactId, initialValues, onSave }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const initialState = { name: "", number: "", email: "" };
  const [contact, setContact] = useState(initialState);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const fetchContact = async () => {
      if (initialValues) {
        setContact((prevState) => ({ ...prevState, ...initialValues }));
      }
      if (!contactId) return;
      try {
        const { data } = await api.get(`/contacts/${contactId}`);
        if (isMounted.current) {
          setContact(data);
        }
      } catch (err) {
        toastError(err);
      }
    };
    fetchContact();
  }, [contactId, open, initialValues]);

  const handleClose = () => {
    onClose();
    setContact(initialState);
  };

  const handleSaveContact = async (values) => {
    try {
      if (contactId) {
        await api.put(`/contacts/${contactId}`, values);
        handleClose();
      } else {
        const { data } = await api.post("/contacts", values);
        if (onSave) onSave(data);
        handleClose();
      }
      toast.success(i18n.t("contactModal.success"));
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        style: {
          borderRadius: 14,
          border: "1px solid #E5E9EF",
          boxShadow: "0 8px 32px rgba(10,15,30,0.10)",
        },
      }}
    >
      <div className={classes.dialogTitle}>
        {contactId
          ? i18n.t("contactModal.title.edit")
          : i18n.t("contactModal.title.add")}
      </div>

      <Formik
        initialValues={contact}
        enableReinitialize={true}
        validationSchema={ContactSchema}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            handleSaveContact(values);
            actions.setSubmitting(false);
          }, 400);
        }}
      >
        {({ values, errors, touched, isSubmitting }) => (
          <Form>
            <DialogContent style={{ padding: "20px 24px" }}>
              <div className={classes.section}>
                <p className={classes.sectionLabel}>
                  {i18n.t("contactModal.form.mainInfo")}
                </p>
                <div className={classes.fieldRow}>
                  <Field
                    as={TextField}
                    label={i18n.t("contactModal.form.name")}
                    name="name"
                    autoFocus
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    size="small"
                    className={classes.field}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("contactModal.form.number")}
                    name="number"
                    error={touched.number && Boolean(errors.number)}
                    helperText={touched.number && errors.number}
                    placeholder="5513912344321"
                    variant="outlined"
                    size="small"
                    className={classes.field}
                  />
                </div>
                <div style={{ marginTop: 14 }}>
                  <Field
                    as={TextField}
                    label={i18n.t("contactModal.form.email")}
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    placeholder="email@exemplo.com"
                    fullWidth
                    variant="outlined"
                    size="small"
                    className={classes.field}
                  />
                </div>
              </div>

              <div className={classes.section}>
                <p className={classes.sectionLabel}>
                  {i18n.t("contactModal.form.extraInfo")}
                </p>
                <FieldArray name="extraInfo">
                  {({ push, remove }) => (
                    <>
                      {values.extraInfo &&
                        values.extraInfo.length > 0 &&
                        values.extraInfo.map((info, index) => (
                          <div className={classes.extraRow} key={`${index}-info`}>
                            <Field
                              as={TextField}
                              label={i18n.t("contactModal.form.extraName")}
                              name={`extraInfo[${index}].name`}
                              variant="outlined"
                              size="small"
                              className={classes.field}
                            />
                            <Field
                              as={TextField}
                              label={i18n.t("contactModal.form.extraValue")}
                              name={`extraInfo[${index}].value`}
                              variant="outlined"
                              size="small"
                              className={classes.field}
                            />
                            <IconButton
                              size="small"
                              className={classes.deleteExtraBtn}
                              onClick={() => remove(index)}
                            >
                              <DeleteOutlineIcon size={18} />
                            </IconButton>
                          </div>
                        ))}
                      <Button
                        className={classes.addExtraBtn}
                        startIcon={<AddIcon size={16} />}
                        onClick={() => push({ name: "", value: "" })}
                      >
                        {i18n.t("contactModal.buttons.addExtraInfo")}
                      </Button>
                    </>
                  )}
                </FieldArray>
              </div>
            </DialogContent>

            <DialogActions style={{ padding: "12px 24px 20px", gap: 10 }}>
              <Button
                onClick={handleClose}
                disabled={isSubmitting}
                className={classes.cancelBtn}
                variant="outlined"
              >
                {i18n.t("contactModal.buttons.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={classes.saveBtn}
                variant="contained"
              >
                {contactId
                  ? i18n.t("contactModal.buttons.okEdit")
                  : i18n.t("contactModal.buttons.okAdd")}
                {isSubmitting && (
                  <CircularProgress size={24} className={classes.buttonProgress} />
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ContactModal;
