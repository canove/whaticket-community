import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";

import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import useQueues from "../../hooks/useQueues";
import useWhatsApps from "../../hooks/useWhatsApps";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";

import type { Error } from "../../types/Error";
import { styled } from "@mui/material/styles";

const FormControlMaxWidth = styled(FormControl)({
  width: "100%",
})

const filterOptions = createFilterOptions({
  trim: true,
});

interface TransferTicketModalProps {
  modalOpen: boolean;
  onClose: () => void;
  ticketid: string | number;
  ticketWhatsappId: string | number;
}

const TransferTicketModal: React.FC<TransferTicketModalProps> = ({
  modalOpen,
  onClose,
  ticketid,
  ticketWhatsappId,
}) => {
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  interface Queue {
    id: string;
    name: string;
  }

  const [queues, setQueues] = useState<Queue[]>([]);
  const [allQueues, setAllQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  interface User {
    id: string;
    name: string;
    queues?: Array<{ id: string; name: string }>;
  }

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedWhatsapp, setSelectedWhatsapp] = useState(ticketWhatsappId);
  //@ts-ignore
  const { findAll: findAllQueues } = useQueues();
  const { loading: loadingWhatsapps, whatsApps } = useWhatsApps();

  const authContext = useContext(AuthContext);
  const loggedInUser = authContext ? authContext.user : null;

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
    if (!modalOpen || searchParam.length < 3) {
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
          toastError(err as Error);
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
      let data: {
        userId?: string | null;
        queueId?: string;
        status?: string;
        whatsappId?: string;
      } = {};

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

      await api.put(`/tickets/${ticketid}`, data);

      setLoading(false);
      navigate(`/tickets`);
    } catch (err) {
      setLoading(false);
      toastError(err as Error);
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
            getOptionLabel={(option) => `${(option as User).name}`}
            onChange={(_e, newValue) => {
              setSelectedUser(newValue as User | null);
              if (
                newValue != null &&
                Array.isArray((newValue as User).queues)
              ) {
                const user = newValue as any;
                setQueues(user.queues);
              } else {
                setQueues(allQueues);
                setSelectedQueue("");
              }
            }}
            options={options}
            filterOptions={filterOptions}
            freeSolo
            autoHighlight
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
          <FormControlMaxWidth variant="outlined">
            <InputLabel>
              {i18n.t("transferTicketModal.fieldQueueLabel")}
            </InputLabel>
            <Select
              value={selectedQueue}
              onChange={(e) => setSelectedQueue(e.target.value as string)}
              label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
            >
              <MenuItem value={""}>&nbsp;</MenuItem>
              {queues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>
                  {queue.name}
                </MenuItem>
              ))}
            </Select>
          </FormControlMaxWidth>
          <Can
            role={loggedInUser.profile}
            perform="ticket-options:transferWhatsapp"
            data={{}}
            yes={() =>
              !loadingWhatsapps ? (
                <FormControlMaxWidth
                  variant="outlined"
                  style={{ marginTop: 20 }}
                >
                  <InputLabel>
                    {i18n.t("transferTicketModal.fieldConnectionLabel")}
                  </InputLabel>
                  <Select
                    value={selectedWhatsapp}
                    onChange={(e) =>
                      setSelectedWhatsapp(e.target.value as string)
                    }
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
                </FormControlMaxWidth>
              ) : (
                <></>
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
