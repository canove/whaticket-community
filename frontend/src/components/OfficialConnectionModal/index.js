import React, { useEffect, useState } from "react";
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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
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

  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },

  multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
		alignItems: "center",
	},

  selectStyle: {
    display: "flex",
    alignItems: "center",
  }
}));

const OfficialConnectionModal = ({ open, onClose, connectionId }) => {
    const { i18n } = useTranslation();
    const classes = useStyles();

    const [name, setName] = useState("");
    const [facebookAccessToken, setFacebookAccessToken] = useState("");
    const [whatsappAccountId, setWhatsappAccountId] = useState("");
    const [isConnectionTested, setIsConnectionTested] = useState(false);

    useEffect(() => {
      const fetchConnection = async () => {
        try {
          const { data } = await api.get(`/whatsapp/${connectionId}`);
          setName(data.name)
          setFacebookAccessToken(data.facebookAccessToken);
          setWhatsappAccountId(data.whatsappAccountId);
        } catch (err) {
          toastError(err);
        }
      };
      if (connectionId) fetchConnection();
    }, [open, connectionId]);

    useEffect(() => {
      setIsConnectionTested(false);
    }, [facebookAccessToken, whatsappAccountId]);

    const handleClose = () => {
      setName("");
      setFacebookAccessToken("");
      setWhatsappAccountId("");
      setIsConnectionTested(false);

      onClose();
    };

    const handleNameChange = (e) => {
      setName(e.target.value);
    }

    const handleFacebookAccessTokenChange = (e) => {
      setFacebookAccessToken(e.target.value);
    };

    const handleWhatsappAccountIdChange = (e) => {
      setWhatsappAccountId(e.target.value);
    }

    const handleSubmit = async () => {
      const connectionData = {
          name: name,
          facebookAccessToken: facebookAccessToken,
          whatsappAccountId: whatsappAccountId,
          official: true,
      };

      try {
        if (connectionId) {
          await api.put(`/whatsapp/${connectionId}`, { name: name });
          toast.success(i18n.t("officialPages.officialModal.saveToast"));
        } else {
          await api.post(`/whatsapp/`, connectionData);
          toast.success(i18n.t("officialPages.officialModal.createToast"));
        }
      } catch (err) {
        toastError(err);
      }

      handleClose();
    };

    const handleConnectionTest = async () => {
      try {
        const { data } = await api.get('/whatsappsession/testConnection', {
          params: { facebookAccessToken, whatsappAccountId }
        });
        if (data) {
          setIsConnectionTested(true);
        } else {
          setIsConnectionTested(false);
          toast.error("ERR_CONNECTION_NOT_AVAILABLE");
        }
      } catch (err) {
        setIsConnectionTested(false);
        toastError(err);
      }
    }

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
            { connectionId
              ? `${i18n.t("officialPages.officialModal.edit")}`
              : `${i18n.t("officialPages.officialModal.add")}`
            }
          </DialogTitle>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    label={i18n.t("officialPages.officialModal.name")}
                    autoFocus
                    value={name}
                    onChange={(e) => { handleNameChange(e) }}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    label={i18n.t("officialPages.officialModal.facebookAccessToken")}
                    value={facebookAccessToken}
                    onChange={(e) => { handleFacebookAccessTokenChange(e) }}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled={connectionId ? true : false}
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    label={i18n.t("officialPages.officialModal.whatsappAccountId")}
                    value={whatsappAccountId}
                    onChange={(e) => { handleWhatsappAccountIdChange(e) }}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled={connectionId ? true : false}
                  />
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  variant="outlined"
                >
                  {i18n.t("officialPages.officialModal.cancelButton")}
                </Button>
                <Button
                  onClick={handleConnectionTest}
                  color="primary"
                  variant="contained"
                >
                  {i18n.t("officialPages.officialModal.testButton")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                  disabled={!isConnectionTested && !connectionId}
                  onClick={handleSubmit}
                >
                   { connectionId
                    ? `${i18n.t("officialPages.officialModal.save")}`
                    : `${i18n.t("officialPages.officialModal.add")}`}
                </Button>
              </DialogActions>
          </Dialog>
      </div>
    );
};

export default OfficialConnectionModal;
