import React, { useContext, useEffect, useRef, useState } from "react";

import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  makeStyles,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";

import { AuthContext } from '../../context/Auth/AuthContext';
import toastError from "../../errors/toastError";
import api from "../../services/api";
import QuickAnswerSelect from '../QuickAnswerSelect';

const useStyles = makeStyles((theme) => ({
  root: {
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    width: "100%",
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
  textQuickAnswerContainer: {
    width: "100%",
  },
}));

const QuickAnswerSchema = Yup.object().shape({
  shortcut: Yup.string()
    .min(2, "Too Short!")
    .max(15, "Too Long!")
    .required("Required"),
  message: Yup.string()
    .min(8, "Too Short!")
    .max(30000, "Too Long!")
    .required("Required"),
});

const QuickAnswersModal = ({
  open,
  onClose,
  quickAnswerInfo,
  onSave,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const initialState = {
    shortcut: "",
    message: ""
  };

  const [quickAnswer, setQuickAnswer] = useState(initialState);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { user } = useContext(AuthContext);

  const handleClose = () => {
    onClose();
    setSelectedUsers([]);
    setQuickAnswer({
      shortcut: "",
      message: ""
    });
  };

  const handleSaveQuickAnswer = async (values) => {
    const userIds = user.profile === "user" ? [user.id, ...selectedUsers] : selectedUsers;
    const quickAnswerData = { ...values, userIds };
    try {
      if (quickAnswerInfo?.id) {
        await api.put(`/quickAnswers/${quickAnswerInfo?.id}`, quickAnswerData);
      } else {
        const { data } = await api.post("/quickAnswers", quickAnswerData);
        if (onSave) {
          onSave(data);
        }
      }
      handleClose();
      toast.success(i18n.t("quickAnswersModal.success"));
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (quickAnswerInfo) {
      setQuickAnswer({
        shortcut: quickAnswerInfo.shortcut,
        message :quickAnswerInfo.message
      });
      const filteredUsers = quickAnswerInfo.users.filter(userInfo => userInfo.id !== user.id);
      setSelectedUsers(filteredUsers.map(userInfo => userInfo.id));
    }
  }, [quickAnswerInfo?.id, open]);

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
          {quickAnswerInfo?.id
            ? `${i18n.t("quickAnswersModal.title.edit")}`
            : `${i18n.t("quickAnswersModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={quickAnswer}
          enableReinitialize={true}
          validationSchema={QuickAnswerSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveQuickAnswer(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.textQuickAnswerContainer}>
                  <Field
                    as={TextField}
                    label={i18n.t("quickAnswersModal.form.shortcut")}
                    name="shortcut"
                    autoFocus
                    error={touched.shortcut && Boolean(errors.shortcut)}
                    helperText={touched.shortcut && errors.shortcut}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    fullWidth
                  />
                </div>
                <div className={classes.textQuickAnswerContainer}>
                  <Field
                    as={TextField}
                    label={i18n.t("quickAnswersModal.form.message")}
                    name="message"
                    error={touched.message && Boolean(errors.message)}
                    helperText={touched.message && errors.message}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    multiline
                    rows={5}
                    fullWidth
                  />
                </div>
                <div>
                  <QuickAnswerSelect
                    selectedUsers={selectedUsers}
                    onChange={values => setSelectedUsers(values)}
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
                  {i18n.t("quickAnswersModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {quickAnswerInfo?.id
                    ? `${i18n.t("quickAnswersModal.buttons.okEdit")}`
                    : `${i18n.t("quickAnswersModal.buttons.okAdd")}`}
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

export default QuickAnswersModal;
