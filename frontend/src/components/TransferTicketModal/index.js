import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";

import CircularProgress from "@material-ui/core/CircularProgress";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";

import { TICKETLOGTYPES } from "../../constants";
import { AuthContext } from "../../context/Auth/AuthContext";
import { UsersPresenceContext } from "../../context/UsersPresenceContext";
import toastError from "../../errors/toastError";
import useQueues from "../../hooks/useQueues";
import useWhatsApps from "../../hooks/useWhatsApps";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { Can } from "../Can";

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
  },
}));

const filterOptions = createFilterOptions({
  trim: true,
});

const TransferTicketModal = ({
  modalOpen,
  onClose,
  ticketid,
  ticketWhatsappId,
}) => {
  const history = useHistory();
  const [options, setOptions] = useState([]);
  const [queues, setQueues] = useState([]);
  const [allQueues, setAllQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedWhatsapp, setSelectedWhatsapp] = useState(ticketWhatsappId);
  const classes = useStyles();
  const { findAll: findAllQueues } = useQueues();
  const { loadingWhatsapps, whatsApps } = useWhatsApps();
  const { connectedUsers } = useContext(UsersPresenceContext);

  const { user: loggedInUser } = useContext(AuthContext);

  useEffect(() => {
    const loadQueues = async () => {
      const list = await findAllQueues();
      setAllQueues(list);
      setQueues(list);
    };
    loadQueues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!modalOpen) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam },
          });
          setOptions(data.users);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };

      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, modalOpen]);

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setSelectedUser(null);
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    if (!ticketid) return;
    setLoading(true);
    try {
      let data = {
        transferred: true,
      };

      if (selectedUser) {
        data.userId = selectedUser.id;
      }

      if (selectedQueue && selectedQueue !== null) {
        data.queueId = selectedQueue;

        if (!selectedUser) {
          data.status = "pending";
          data.userId = null;
        }
      }

      if (selectedWhatsapp) {
        data.whatsappId = selectedWhatsapp;
      }

      // clear the helpUsers on trasnfer
      data.helpUsersIds = [];

      await api.put(`/tickets/${ticketid}`, data);

      await api.post(`/privateMessages/${ticketid}`, {
        // body: `${user?.name} *aceptó* la conversación`,
        body: `${loggedInUser?.name} *transfirió* la conversación para ${selectedUser?.name}`,
      });

      await api.post(`/ticketLog`, {
        ticketId: ticketid,
        userId: loggedInUser?.id,
        newUserId: selectedUser?.id,
        logType: TICKETLOGTYPES.TRANSFER,
        ticketStatus: "open",
      });

      setLoading(false);
      history.push(`/tickets`);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <form onSubmit={handleSaveTicket}>
        <DialogTitle id="form-dialog-title">
          {i18n.t("transferTicketModal.title")}
        </DialogTitle>
        <DialogContent dividers>
          <Autocomplete
            style={{ width: 300, marginBottom: 20 }}
            getOptionLabel={(option) => `${option.name}`}
            renderOption={(option) => {
              return (
                <div>
                  {connectedUsers.find((id) => id === option.id) ? "🟢" : "🟡"}{" "}
                  {option.name}
                </div>
              );
            }}
            onChange={(e, newValue) => {
              setSelectedUser(newValue);
              if (newValue != null && Array.isArray(newValue.queues)) {
                setQueues(newValue.queues);
              } else {
                setQueues(allQueues);
                setSelectedQueue("");
              }
            }}
            options={options}
            filterOptions={filterOptions}
            freeSolo
            autoHighlight
            openOnFocus={true}
            noOptionsText={i18n.t("transferTicketModal.noOptions")}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label={i18n.t("transferTicketModal.fieldLabel")}
                variant="outlined"
                required
                autoFocus
                onChange={(e) => setSearchParam(e.target.value)}
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
          <FormControl variant="outlined" className={classes.maxWidth}>
            <InputLabel>
              {i18n.t("transferTicketModal.fieldQueueLabel")}
            </InputLabel>
            <Select
              value={selectedQueue}
              onChange={(e) => setSelectedQueue(e.target.value)}
              label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
            >
              <MenuItem value={""}>&nbsp;</MenuItem>
              {queues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>
                  {queue.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Can
            role={loggedInUser.profile}
            perform="ticket-options:transferWhatsapp"
            yes={() =>
              !loadingWhatsapps && (
                <FormControl
                  variant="outlined"
                  className={classes.maxWidth}
                  style={{ marginTop: 20 }}
                >
                  <InputLabel>
                    {i18n.t("transferTicketModal.fieldConnectionLabel")}
                  </InputLabel>
                  <Select
                    value={selectedWhatsapp}
                    onChange={(e) => setSelectedWhatsapp(e.target.value)}
                    label={i18n.t(
                      "transferTicketModal.fieldConnectionPlaceholder"
                    )}
                  >
                    {whatsApps.map((whasapp) => (
                      <MenuItem key={whasapp.id} value={whasapp.id}>
                        {whasapp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            disabled={loading}
            variant="outlined"
          >
            {i18n.t("transferTicketModal.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="submit"
            color="primary"
            loading={loading}
          >
            {i18n.t("transferTicketModal.buttons.ok")}
          </ButtonWithSpinner>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransferTicketModal;
