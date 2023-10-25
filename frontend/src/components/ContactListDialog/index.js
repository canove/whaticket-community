import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  multFieldLine: {
    display: "flex",
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

const ContactListSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const ContactListModal = ({ open, onClose, contactListId }) => {
  const classes = useStyles();

  const initialState = {
    name: "",
  };

  const [contactList, setContactList] = useState(initialState);

  useEffect(() => {
    const fetchContactList = async () => {
      if (!contactListId) return;
      try {
        const { data } = await api.get(`/contact-lists/${contactListId}`);
        setContactList((prevState) => {
          return { ...prevState, ...data };
        });
      } catch (err) {
        toastError(err);
      }
    };

    fetchContactList();
  }, [contactListId, open]);

  const handleClose = () => {
    onClose();
    setContactList(initialState);
  };

  const handleSaveContactList = async (values) => {
    const contactListData = { ...values };
    try {
      if (contactListId) {
        await api.put(`/contact-lists/${contactListId}`, contactListData);
      } else {
        await api.post("/contact-lists", contactListData);
      }
      toast.success(i18n.t("contactList.dialog"));
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
        maxWidth="xs"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {contactListId
            ? `${i18n.t("contactLists.dialog.edit")}`
            : `${i18n.t("contactLists.dialog.add")}`}
        </DialogTitle>
        <Formik
          initialValues={contactList}
          enableReinitialize={true}
          validationSchema={ContactListSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveContactList(values);
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
                    label={i18n.t("contactLists.dialog.name")}
                    autoFocus
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    fullWidth
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
                  {i18n.t("contactLists.dialog.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {contactListId
                    ? `${i18n.t("contactLists.dialog.okEdit")}`
                    : `${i18n.t("contactLists.dialog.okAdd")}`}
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

export default ContactListModal;
