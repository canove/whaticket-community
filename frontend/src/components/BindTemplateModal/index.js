import React, { useContext, useEffect, useState } from "react";
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
  Typography,
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

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
    display: "flex",
    flexWrap: "wrap",
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
  },
}));

const BindTemplateModal = ({ open, onClose, template }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();

  const { whatsApps } = useContext(WhatsAppsContext);

  const [connections, setConnections] = useState([]);
  const [openConnectionsSelect, setOpenConnectionsSelect] = useState(false);

  const [selectedOfficialWhats, setSelectedOfficialWhats] = useState("");
  const [officialWhatsapps, setOfficialWhatsapps] = useState([]);

  useEffect(() => {
    const fetchOfficialWhats = async () => {
      try {
        const { data } = await api.get("/officialWhatsapps");
        setOfficialWhatsapps(data);
      } catch (err) {
        toastError(err);
      }
    };

    fetchOfficialWhats();
  }, [open]);

  const handleClose = () => {
    onClose();
    setSelectedOfficialWhats("");
    setConnections([]);
  };

  const handleSubmit = async () => {
    const body = {
      whatsappIds: connections,
      templateId: template.id,
      officialWhatsappId: selectedOfficialWhats
    };

    try {
      await api.post("/whatsappTemplate/bind", body);
      toast.success("Vinculando números...");
    } catch (err) {
      toastError(err);
    }

    handleClose();
  };

  const handleConnectionsChange = (e) => {
    const value = e.target.value;
    const allIndex = value.indexOf("all");

    if (allIndex !== -1 && allIndex === value.length - 1) {
      setConnections([]);

      const allConnections = ["all"];

      setConnections(allConnections);
      setOpenConnectionsSelect(false);
    } else {
      if ((allIndex || allIndex === 0) && allIndex !== -1) {
        value.splice(allIndex, 1);
      }
      setConnections(typeof value === "string" ? value.split(",") : value);
    }
  };

  const handleOpenConnectionsSelect = () => {
    setOpenConnectionsSelect(true);
  };

  const handleCloseConnectionsSelect = () => {
    setOpenConnectionsSelect(false);
  };

  const handleOffConnectionChange = (e) => {
    setSelectedOfficialWhats(e.target.value);
    setConnections([]);
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
        <DialogTitle id="form-dialog-title">Vincular Números</DialogTitle>
        <DialogContent dividers>
          <div className={classes.multFieldLine}>
            <Typography variant="subtitle1">
              Template: {template?.name}
            </Typography>
          </div>
          <div className={classes.multFieldLine}>
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="off-connection-type-select-label">
                Conexões
              </InputLabel>
              <Select
                labelId="off-connection-type-select-label"
                id="connection-type-select"
                value={selectedOfficialWhats}
                label="Conexões"
                onChange={handleOffConnectionChange}
                style={{ width: "100%" }}
                variant="outlined"
              >
                {officialWhatsapps.map((officialWhats) => (
                  <MenuItem key={officialWhats.id} value={officialWhats.id}>
                    {officialWhats.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          {selectedOfficialWhats && (
            <div className={classes.multFieldLine}>
              <FormControl variant="outlined" margin="normal" fullWidth>
                <InputLabel id="connections-select-label">Telefones</InputLabel>
                <Select
                  variant="outlined"
                  labelId="connections-select-label"
                  id="connections-select"
                  value={connections}
                  label="Telefones"
                  onChange={handleConnectionsChange}
                  multiple
                  open={openConnectionsSelect}
                  onOpen={handleOpenConnectionsSelect}
                  onClose={handleCloseConnectionsSelect}
                  style={{ width: "100%" }}
                >
                  <MenuItem value={"all"}>
                    {i18n.t("importModal.form.all")}
                  </MenuItem>
                  {whatsApps.map((whats) => {
                    if (
                      whats.official &&
                      whats.officialWhatsappId === selectedOfficialWhats
                    ) {
                      return (
                        <MenuItem value={whats.id} key={whats.id}>
                          {whats.name}
                        </MenuItem>
                      );
                    }
                    return null;
                  })}
                </Select>
              </FormControl>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="outlined">
            {i18n.t("flows.flowsModal.cancel")}
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            className={classes.btnWrapper}
            onClick={handleSubmit}
          >
            Vincular
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BindTemplateModal;
