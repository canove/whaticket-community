import React, { useContext, useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import TextField from "@material-ui/core/TextField";

import CircularProgress from "@material-ui/core/CircularProgress";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import { UsersPresenceContext } from "../../context/UsersPresenceContext";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
  },
}));

const filterOptions = createFilterOptions({
  trim: true,
});

const AskForHelpTicketModal = ({ modalOpen, onClose, ticket }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const { connectedUsers } = useContext(UsersPresenceContext);

  const { user: loggedInUser } = useContext(AuthContext);

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
    if (!ticket || !selectedUser) return;
    setLoading(true);

    try {
      await api.put(`/tickets/${ticket.id}`, {
        helpUsersIds: [
          ...ticket.helpUsers?.map((hu) => hu.id),
          selectedUser.id,
        ],
      });

      await api.post(`/privateMessages/${ticket.id}`, {
        body: `${loggedInUser?.name} *pidió apoyo* en la conversación a ${selectedUser?.name}`,
      });
      onClose();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <form onSubmit={handleSaveTicket}>
        <DialogTitle id="form-dialog-title">Pedir apoyo a:</DialogTitle>
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
            Incluir en la conversación
          </ButtonWithSpinner>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AskForHelpTicketModal;
