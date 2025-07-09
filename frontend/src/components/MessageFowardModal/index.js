import React, { useState, useEffect, useContext } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModal from "../ContactModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  online: {
    fontSize: 11,
    color: "#25d366",
  },
  offline: {
    fontSize: 11,
    color: "#e1306c",
  },
}));

const filter = createFilterOptions({
  trim: true,
});

const MessageForwardModal = ({
  modalOpen,
  onClose,
  initialContact,
  message,
}) => {
  const [options, setOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
  const [newContact, setNewContact] = useState({});
  const [whatsapps, setWhatsapps] = useState([]);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { companyId, whatsappId } = user;
  const [openAlert, setOpenAlert] = useState(false);

  useEffect(() => {
    if (initialContact?.id !== undefined) {
      setOptions([initialContact]);
      setSelectedContact(initialContact);
    }
  }, [initialContact]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        api
          .get(`/whatsapp`, { params: { companyId, session: 0 } })
          .then(({ data }) => setWhatsapps(data));
      };

      if (whatsappId !== null && whatsappId !== undefined) {
        setSelectedWhatsapp(whatsappId);
      }

      if (user.queues.length === 1) {
        setSelectedQueue(user.queues[0].id);
      }
      fetchContacts();
      setLoading(false);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, []);

  useEffect(() => {
    if (!modalOpen || searchParam.length < 3) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("contacts", {
            params: { searchParam },
          });
          setOptions(data.contacts);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, modalOpen]);

  const forwardMessage = async (message, contactId, userId) => {
    const remote = message.remoteJid.split("@");
    console.log(message);
    await api.post(
      `/fw?toId=${contactId}&uId=${userId}&gp=${
        remote[1].includes("g.us") ? 1 : 0
      }`,
      { msg: message.dataJson }
    );
    return;
  };

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setOpenAlert(false);
    setSelectedContact(null);
  };

  const handleForwardMessage = async (contactId) => {
    if (!contactId) return;
    setLoading(true);
    try {
      await forwardMessage(message, contactId, user.id);
      onClose();
    } catch (err) {
      onClose();
    }
    setLoading(false);
  };

  const handleSelectOption = (e, newValue) => {
    if (newValue?.number) {
      setSelectedContact(newValue);
    } else if (newValue?.name) {
      setNewContact({ name: newValue.name });
      setContactModalOpen(true);
    }
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
  };

  const handleAddNewContactTicket = (contact) => {
    handleForwardMessage(contact.id);
  };

  const createAddContactOption = (filterOptions, params) => {
    const filtered = filter(filterOptions, params);
    if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
      filtered.push({
        name: `${params.inputValue}`,
      });
    }
    return filtered;
  };

  const renderOption = (option) => {
    if (option.number) {
      return (
        <>
          {/* {IconChannel(option.channel)} */}
          <Typography
            component="span"
            style={{
              fontSize: 14,
              marginLeft: "10px",
              display: "inline-flex",
              alignItems: "center",
              lineHeight: "2",
            }}
          >
            {option.name} - {option.number}
          </Typography>
        </>
      );
    } else {
      return `${i18n.t("messageForward.add")} ${option.name}`;
    }
  };

  const renderOptionLabel = (option) => {
    if (option.number) {
      return `${option.name} - ${option.number}`;
    } else {
      return `${option.name}`;
    }
  };

  const renderContactAutocomplete = () => {
    if (initialContact === undefined || initialContact.id === undefined) {
      return (
        <Grid xs={12} item>
          <Autocomplete
            fullWidth
            options={options}
            loading={loading}
            clearOnBlur
            autoHighlight
            freeSolo
            clearOnEscape
            getOptionLabel={renderOptionLabel}
            renderOption={renderOption}
            filterOptions={createAddContactOption}
            onChange={(e, newValue) => handleSelectOption(e, newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={i18n.t("messageForward.fieldLabel")}
                variant="outlined"
                autoFocus
                onChange={(e) => setSearchParam(e.target.value)}
                onKeyPress={(e) => {
                  if (loading || !selectedContact) return;
                  else if (e.key === "Enter") {
                    handleForwardMessage(selectedContact.id);
                  }
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        </Grid>
      );
    }
    return null;
  };

  return (
    <>
      <ContactModal
        open={contactModalOpen}
        initialValues={newContact}
        onClose={handleCloseContactModal}
        onSave={handleAddNewContactTicket}
      ></ContactModal>
      <Dialog open={modalOpen} onClose={handleClose}>
        <DialogTitle id="form-dialog-title">
          {i18n.t("messageForward.title")}
        </DialogTitle>
        <DialogContent dividers>
          <Grid style={{ width: 300 }} container spacing={2}>
            {renderContactAutocomplete()}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            disabled={loading}
            variant="outlined"
          >
            {i18n.t("messageForward.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="button"
            disabled={!selectedContact}
            onClick={() => handleForwardMessage(selectedContact.id)}
            color="primary"
            loading={loading}
          >
            {i18n.t("messageForward.buttons.ok")}
          </ButtonWithSpinner>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default MessageForwardModal;
