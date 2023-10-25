import React, { useState, useEffect, useRef } from "react";

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
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import IconButton from "@material-ui/core/IconButton";

import { i18n } from "../../translate/i18n";
import { head } from "lodash";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import ConfirmationModal from "../ConfirmationModal";

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
  colorAdorment: {
    width: 20,
    height: 20,
  },
}));

const AnnouncementSchema = Yup.object().shape({
  title: Yup.string().required("Obrigatório"),
  text: Yup.string().required("Obrigatório"),
});

const AnnouncementModal = ({ open, onClose, announcementId, reload }) => {
  const classes = useStyles();

  const initialState = {
    title: "",
    text: "",
    priority: 3,
    status: true,
  };

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(initialState);
  const [attachment, setAttachment] = useState(null);
  const attachmentFile = useRef(null);

  useEffect(() => {
    try {
      (async () => {
        if (!announcementId) return;

        const { data } = await api.get(`/announcements/${announcementId}`);
        setAnnouncement((prevState) => {
          return { ...prevState, ...data };
        });
      })();
    } catch (err) {
      toastError(err);
    }
  }, [announcementId, open]);

  const handleClose = () => {
    setAnnouncement(initialState);
    setAttachment(null);
    onClose();
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveAnnouncement = async (values) => {
    const announcementData = { ...values };
    try {
      if (announcementId) {
        await api.put(`/announcements/${announcementId}`, announcementData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(
            `/announcements/${announcementId}/media-upload`,
            formData
          );
        }
      } else {
        const { data } = await api.post("/announcements", announcementData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/announcements/${data.id}/media-upload`, formData);
        }
      }
      toast.success(i18n.t("announcements.toasts.success"));
      if (typeof reload == "function") {
        reload();
      }
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (announcement.mediaPath) {
      await api.delete(`/announcements/${announcement.id}/media-upload`);
      setAnnouncement((prev) => ({
        ...prev,
        mediaPath: null,
      }));
      toast.success(i18n.t("announcements.toasts.deleted"));
      if (typeof reload == "function") {
        reload();
      }
    }
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title={i18n.t("announcements.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("announcements.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {announcementId
            ? `${i18n.t("announcements.dialog.edit")}`
            : `${i18n.t("announcements.dialog.add")}`}
        </DialogTitle>
        <div style={{ display: "none" }}>
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            ref={attachmentFile}
            onChange={(e) => handleAttachmentFile(e)}
          />
        </div>
        <Formik
          initialValues={announcement}
          enableReinitialize={true}
          validationSchema={AnnouncementSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveAnnouncement(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form>
              <DialogContent dividers>
                <Grid spacing={2} container>
                  <Grid xs={12} item>
                    <Field
                      as={TextField}
                      label={i18n.t("announcements.dialog.form.title")}
                      name="title"
                      error={touched.title && Boolean(errors.title)}
                      helperText={touched.title && errors.title}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={12} item>
                    <Field
                      as={TextField}
                      label={i18n.t("announcements.dialog.form.text")}
                      name="text"
                      error={touched.text && Boolean(errors.text)}
                      helperText={touched.text && errors.text}
                      variant="outlined"
                      margin="dense"
                      multiline={true}
                      rows={7}
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={12} item>
                    <FormControl variant="outlined" margin="dense" fullWidth>
                      <InputLabel id="status-selection-label">
                        {i18n.t("announcements.dialog.form.status")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("announcements.dialog.form.status")}
                        placeholder={i18n.t("announcements.dialog.form.status")}
                        labelId="status-selection-label"
                        id="status"
                        name="status"
                        error={touched.status && Boolean(errors.status)}
                      >
                        <MenuItem value={true}>Ativo</MenuItem>
                        <MenuItem value={false}>Inativo</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} item>
                    <FormControl variant="outlined" margin="dense" fullWidth>
                      <InputLabel id="priority-selection-label">
                        {i18n.t("announcements.dialog.form.priority")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("announcements.dialog.form.priority")}
                        placeholder={i18n.t(
                          "announcements.dialog.form.priority"
                        )}
                        labelId="priority-selection-label"
                        id="priority"
                        name="priority"
                        error={touched.priority && Boolean(errors.priority)}
                      >
                        <MenuItem value={1}>Alta</MenuItem>
                        <MenuItem value={2}>Média</MenuItem>
                        <MenuItem value={3}>Baixa</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  {(announcement.mediaPath || attachment) && (
                    <Grid xs={12} item>
                      <Button startIcon={<AttachFileIcon />}>
                        {attachment ? attachment.name : announcement.mediaName}
                      </Button>
                      <IconButton
                        onClick={() => setConfirmationOpen(true)}
                        color="secondary"
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                {!attachment && !announcement.mediaPath && (
                  <Button
                    color="primary"
                    onClick={() => attachmentFile.current.click()}
                    disabled={isSubmitting}
                    variant="outlined"
                  >
                    {i18n.t("announcements.dialog.buttons.attach")}
                  </Button>
                )}
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("announcements.dialog.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {announcementId
                    ? `${i18n.t("announcements.dialog.buttons.add")}`
                    : `${i18n.t("announcements.dialog.buttons.edit")}`}
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

export default AnnouncementModal;
