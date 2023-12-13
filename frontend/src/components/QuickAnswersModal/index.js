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

let dinamicSchema = {
  shortcut: Yup.string()
    .min(2, "Too Short!")
    .max(15, "Too Long!")
    .required("Required"),
  message: Yup.string()
    .max(30000, "Too Long!")
    .required("Required"),
}

let QuickAnswerSchema = Yup.object().shape(dinamicSchema);

const QuickAnswersModal = ({
  open,
  onClose,
  quickAnswerId,
  initialValues,
  onSave,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  let initialState = {
    shortcut: "",
    message: "",
  };

  const [quickAnswer, setQuickAnswer] = useState(initialState);
  let [moreQuickAnswers, setMoreQuickAnswers] = useState(["message"]);

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
        const messagesValues = data.message.split('/:/');

        for (let i = 0; i <= messagesValues.length - 1; i += 1) {
          data[i === 0 ? 'message' : `message${[i]}`] = messagesValues[i];
        }
        if (isMounted.current) {
          setMoreQuickAnswers(Object.keys(data).filter((i) => i.includes('message')));
          setQuickAnswer(data);
        }
      } catch (err) {
        toastError(err.message);
      }
    };
    fetchQuickAnswer();
  }, [quickAnswerId, open, initialValues]);

  const handleClose = () => {
    onClose();
    setQuickAnswer(initialState);
    setMoreQuickAnswers(["message"]);
  };

  const handleNewQuickAnswer = (values) => {
    const fields = Object.keys(values).filter((key) => key.includes('message'));

    initialState = values;

    for (let i = 0; i <= fields.length - 1; i += 1) {
    dinamicSchema[`message${[fields.length - 1 + 1]}`] = Yup.string()
    .max(30000, "Too Long!")
    .required("Required");

    QuickAnswerSchema = Yup.object().shape(dinamicSchema); //recriando com a nova propriedade
 
    values[`message${[fields.length - 1 + 1]}`] = values[`message${[fields.length - 1 + 1]}`];

    setQuickAnswer(values);
    setMoreQuickAnswers(Object.keys(values).filter((key) => key.includes('message')));

  }

}

const handleDeleteQuickAnswer = (values, answer) => {
  const fields = Object.keys(values).filter((key) => key.includes('message'));
  if (quickAnswerId) {
    if (fields.length > 1 || values[answer] === undefined) {
      delete values[answer]
      setMoreQuickAnswers(Object.keys(values).filter((key) => key.includes('message')));
    } else {
      toast.error("Não foi possível completar a ação. É necessário ter pelo menos uma mensagem")
    }
  } else {
    if (fields.length > 1 || values[answer] === undefined) {
      delete values[answer]
      setMoreQuickAnswers(Object.keys(values).filter((key) => key.includes('message')));
    } else {
      toast.error("Não foi possível completar a ação. É necessário ter pelo menos uma mensagem")
    }
  }

}

const handleSaveQuickAnswer = async (values) => {
  try {
    if (quickAnswerId) {
      const quickAnswerIdMessages = Object.values(values).filter((i) => i !== values.id && i !== values.shortcut && i !== values.createdAt && i !== values.updatedAt);
      const messageString = `${quickAnswerIdMessages.join('/:/')}`;

      values = { shortcut: values.shortcut, message: messageString }

      await api.put(`/quickAnswers/${quickAnswerId}`, values);
      handleClose();

    } else {
      const quickAnswerIdMessages = Object.values(values).filter((i) => i !== values.id && i !== values.shortcut && i !== values.createdAt && i !== values.updatedAt);
      const messageString = `${quickAnswerIdMessages.join('/:/')}`;

      values = { shortcut: values.shortcut, message: messageString }

      const { data } = await api.post("/quickAnswers", values);
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
            setMoreQuickAnswers(["message"]);
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
                {moreQuickAnswers.map((answer) => (
                  <div key={answer}>
                    <Field
                      as={TextField}
                      label={i18n.t("quickAnswersModal.form.message")}
                      name={answer}
                      error={touched[answer] && Boolean(errors[answer])}
                      helperText={touched[answer] && errors[answer]}
                      variant="outlined"
                      margin="dense"
                      className={classes.textField}
                      multiline
                      minRows={5}
                      fullWidth
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        handleDeleteQuickAnswer(values, answer);
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </div>
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                type="button"
                color="primary"
                disabled={isSubmitting}
                variant="contained"
                className={classes.btnWrapper}
                onClick={() => handleNewQuickAnswer(values) }
              >
                {`${i18n.t("+")}`}
              </Button>

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
  </div >
);
};

export default QuickAnswersModal;