import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import {
  makeStyles,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from "@material-ui/core";
import { DeleteOutline } from "@material-ui/icons";
import { green } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";

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
  quickAnswerId,
  initialValues,
  onSave,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const initialState = {
    shortcut: "",
    message: "",
  };

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [quickAnswer, setQuickAnswer] = useState(initialState);
  let [moreQuickAnswers, setMoreQuickAnswers] = useState(["0"]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchQuickAnswer = async () => {
      if (initialValues) {
        setQuickAnswer((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      if (!quickAnswerId) return;

      try {
        const { data } = await api.get(`/quickAnswers/${quickAnswerId}`);
        if (isMounted.current) {
          setQuickAnswer(data);
        }
      } catch (err) {
        toastError(err);
      }
    };

    fetchQuickAnswer();
  }, [quickAnswerId, open, initialValues]);

  const handleClose = () => {
    onClose();
    setQuickAnswer(initialState);
  };

  const handleNewQuickAnswer = (e) => {
    for(let i = 0; i < e.form.length; i += 1) {
      const field = e.form[i].name;
      if(field.length > 0 && field.includes("message")) {
        setMoreQuickAnswers([...moreQuickAnswers, e.form[i].textContent])
      }
    }
  };

  const handleDeleteQuickAnswer = (values, fieldIndex) => {
      // const messages = Object.values(values).filter( (i) => i !== values.shortcut);
      const list = moreQuickAnswers.splice(1);
      console.log('estado', list);
      const filtered = list.filter((i, index) => i[index] !== fieldIndex)
      setMoreQuickAnswers(filtered)
  }

  const handleSaveQuickAnswer = async (values) => {
    const messages = Object.values(values).filter( (i) => i !== values.shortcut);
    for(let i = 0; i <= messages.length; i += 1){
      values = { shortcut: values.shortcut, message: `${messages}` }
    }
    try {
      if (quickAnswerId) {
        await api.put(`/quickAnswers/${quickAnswerId}`, values);
        handleClose();
      } else {
        const { data } = await api.post("/quickAnswers", { shortcut: values.shortcut, message: values.message });
        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("quickAnswersModal.success"));
    } catch (err) {
      toastError(err);
    }
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
          {quickAnswerId
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
              setMoreQuickAnswers(["0"])
              setMoreQuickAnswers(["0"])
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
                  { quickAnswerId && quickAnswer.message.split(',').map((i, index) => (
                    <Field
                      key={index}
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
                      value={quickAnswerId && i}
                    />
                  ))
                  }
                  { Object.values(values).filter((i) => i !== values.shortcut).length <= 1 ? moreQuickAnswers.map((i, index) => (
                    <div className={classes.textQuickAnswerContainer}>
                      <Field
                        key={i}
                        as={TextField}
                        label={i18n.t("quickAnswersModal.form.message")}
                        name={moreQuickAnswers.length === 1 ? "message" : `message${[index]}`}
                        error={touched.message && Boolean(errors.message)}
                        helperText={touched.message && errors.message}
                        variant="outlined"
                        margin="dense"
                        className={classes.textField}
                        multiline
                        fullWidth
                        rows={5}
                      />
                      { /* Botão excluir nova mensagem rápida */ }
                      <IconButton
                        size="small"
                        onClick={() => {
                          // setConfirmModalOpen(true);
                          handleDeleteQuickAnswer(values, i, index);
                        }}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </div>
                    )) : moreQuickAnswers.map((i, index) => (
                      <div className={classes.textQuickAnswerContainer}>
                        <Field
                          key={i}
                          as={TextField}
                          label={i18n.t("quickAnswersModal.form.message")}
                          name={moreQuickAnswers.length === 1 ? "message" : `message${[index]}`}
                          error={touched.message && Boolean(errors.message)}
                          helperText={touched.message && errors.message}
                          variant="outlined"
                          margin="dense"
                          className={classes.textField}
                          multiline
                          fullWidth
                          rows={5}
                        />
                        { /* Botão excluir nova mensagem rápida */ }
                        <IconButton
                          size="small"
                          onClick={() => {
                            // setConfirmModalOpen(true);
                            handleDeleteQuickAnswer(values, i, index);
                          }}
                        >
                          <DeleteOutline />
                        </IconButton>
                      </div>
                      ))
                     }
                </div>
              </DialogContent>
              <DialogActions>

              { !quickAnswerId && (
                <Button
                  type="button"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                  onClick={ (e) => handleNewQuickAnswer(e.target.parentNode) }
                >
                  {`${i18n.t("+")}`}
                </Button>
                )
              }
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
                  {quickAnswerId
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