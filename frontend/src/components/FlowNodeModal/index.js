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
  Box,
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

const FlowNodeModal = ({ open, onClose, flowId }) => {
    const { i18n } = useTranslation();
    const classes = useStyles();

    //                   dom   seg   ter   qua   qui   sex   sab
    // const initialDays = [false,false,false,false,false,false,false]

    const [name, setName] = useState("");
    const [status, setStatus] = useState("active");
    const [official, setOfficial] = useState("nooff");
    // const [useAutoFlow, setUseAutoFlow] = useState(false);
    // const [days, setDays] = useState(initialDays);
    // const [hours, setHours] = useState("");
    // const [crons, setCrons] = useState([]);

    useEffect(() => {
      const fetchFlow = async () => {
        if (!flowId) return;
        try {
          const { data } = await api.get(`/flows/${flowId}`);
          setName(data.name)
          setStatus(data.status);
          setOfficial(data.official ? "off" : "nooff");
        } catch (err) {
          toastError(err);
        }
      };
      fetchFlow();
    }, [open, flowId]);

    // useEffect(() => {
    //   if (useAutoFlow) createCron();
    // }, [useAutoFlow, days, hours]);

    // useEffect(() => {
    //   readCrons(crons);
    // }, [crons]);

    const handleClose = () => {
      setName("");
      setStatus("active");
      setOfficial("nooff");
      // setDays(initialDays);
      // setHours("");
      // setCrons([]);
      // setUseAutoFlow(false);

      onClose();
    };

    const handleNameChange = (e) => {
      setName(e.target.value);
    };

    const handleStatusChange = (e) => {
      setStatus(e.target.value);
    }

    // const handleDayChange = (e, day) => {
    //   if (day === "dom") setDays([e.target.checked, days[1], days[2], days[3], days[4], days[5], days[6]]);
    //   if (day === "seg") setDays([days[0], e.target.checked, days[2], days[3], days[4], days[5], days[6]]);
    //   if (day === "ter") setDays([days[0], days[1], e.target.checked, days[3], days[4], days[5], days[6]]);
    //   if (day === "qua") setDays([days[0], days[1], days[2], e.target.checked, days[4], days[5], days[6]]);
    //   if (day === "qui") setDays([days[0], days[1], days[2], days[3], e.target.checked, days[5], days[6]]);
    //   if (day === "sex") setDays([days[0], days[1], days[2], days[3], days[4], e.target.checked, days[6]]);
    //   if (day === "sab") setDays([days[0], days[1], days[2], days[3], days[4], days[5], e.target.checked]);
    // }

    // const createCron = () => {
    //   if (!useAutoFlow || !hours || !days.includes(true)) {
    //     setCrons([]);
    //     return;
    //   }

    //   const hourList = hours.split(",");

    //   const crons = hourList.map(hour => {
    //     let cron = "";
    //     let [h, m] = hour.split(":");

    //     if (!h || !m) return null;

    //     cron = `${m} ${h} * * `;

    //     let selectedDays = []
    //     days.forEach((value, index) => { if (value) selectedDays.push(index) });
    //     let daysString = selectedDays.toString();
    //     cron += daysString;

    //     return cron;
    //   });

    //   if (crons.includes(undefined) || crons.includes(null)) {
    //     setCrons([]);
    //     return;
    //   };

    //   setCrons(crons);
    // }

    // const readCrons = (crons) => {
    //   let daysList = [];
    //   const hoursList = [];

    //   for (const cron of crons) {
    //     const cronItems = cron.split(" ");
    //     const minutes = cronItems[0];
    //     const hour = cronItems[1];
    //     const days = cronItems[4];

    //     const time = `${hour}:${minutes}`;

    //     hoursList.push(time);
    //     daysList = days.split(",");
    //   }

    //   console.log(daysList);
    //   console.log(hoursList.toString());
    // }

    const handleSubmit = async () => {
      const flowData = {
          name: name,
          status: status,
          type: "bits",
          official: official === "off" ? true : false
      };

      try {
        if (flowId) {
          await api.put(`/flows/${flowId}`, flowData);
          toast.success(i18n.t("flows.confirmation.edit"));
        } else {
          await api.post(`/flows/`, flowData);
          toast.success(i18n.t("flows.confirmation.create"));
        }
        handleClose();
      } catch (err) {
        toastError(err);
      }
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
          <DialogTitle id="form-dialog-title">
            { flowId
              ? `${i18n.t("flows.flowsModal.edit")}`
              : `${i18n.t("flows.flowsModal.add")}`
            }
          </DialogTitle>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    label={i18n.t("flows.flowsModal.name")}
                    autoFocus
                    value={name}
                    name="name"
                    onChange={(e) => { handleNameChange(e) }}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div className={classes.selectStyle}>
                    <FormControl
                      variant="outlined"
                      margin="normal"
                      fullWidth
                    >
                      <InputLabel id="status-select-label">
                        Status
                      </InputLabel>
                      <Select
                        labelId="status-select-label"
                        id="status-select"
                        value={status}
                        label="Status"
                        onChange={handleStatusChange}
                        style={{width: "100%"}}
                        variant="outlined"
                      >
                        <MenuItem value={"active"}>Ativo</MenuItem>
                        <MenuItem value={"inactive"}>Inativo</MenuItem>
                      </Select>
                  </FormControl>
                </div>
                {/* {!flowId &&
                  <div className={classes.selectStyle}>
                      <FormControl
                        variant="outlined"
                        margin="normal"
                        fullWidth
                      >
                        <InputLabel id="official-select-label">
                          Oficial
                        </InputLabel>
                        <Select
                          labelId="official-select-label"
                          id="official-select"
                          value={official}
                          label="Oficial"
                          onChange={(e) => setOfficial(e.target.value)}
                          fullWidth
                          variant="outlined"
                        >
                          <MenuItem value={"off"}>Oficial</MenuItem>
                          <MenuItem value={"nooff"}>Não Oficial</MenuItem>
                        </Select>
                    </FormControl>
                  </div>
                } */}
                <div className={classes.selectStyle}>
                      <FormControl
                        variant="outlined"
                        margin="normal"
                        fullWidth
                      >
                        <InputLabel id="official-select-label">
                          Oficial
                        </InputLabel>
                        <Select
                          labelId="official-select-label"
                          id="official-select"
                          value={official}
                          label="Oficial"
                          onChange={(e) => setOfficial(e.target.value)}
                          fullWidth
                          variant="outlined"
                        >
                          <MenuItem value={"off"}>Oficial</MenuItem>
                          <MenuItem value={"nooff"}>Não Oficial</MenuItem>
                        </Select>
                    </FormControl>
                  </div>
                {/* <div>
                  <FormControlLabel
                    label="Fluxo automático"
                    control={
                      <Checkbox
                        checked={useAutoFlow}
                        indeterminate={useAutoFlow === false}
                        onChange={() => setUseAutoFlow(prevAutoFlow => !prevAutoFlow)}
                        color="primary"
                      />
                    }
                  />
                  { useAutoFlow &&
                    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
                      <FormControlLabel
                        label="Segunda"
                        control={<Checkbox color="primary" checked={days[1]} onChange={(e) => { handleDayChange(e, "seg") }} />}
                      />
                      <FormControlLabel
                        label="Terça"
                        control={<Checkbox color="primary" checked={days[2]} onChange={(e) => { handleDayChange(e, "ter") }} />}
                      />
                      <FormControlLabel
                        label="Quarta"
                        control={<Checkbox color="primary" checked={days[3]} onChange={(e) => { handleDayChange(e, "qua") }} />}
                      />
                      <FormControlLabel
                        label="Quinta"
                        control={<Checkbox color="primary" checked={days[4]} onChange={(e) => { handleDayChange(e, "qui") }} />}
                      />
                      <FormControlLabel
                        label="Sexta"
                        control={<Checkbox color="primary" checked={days[5]} onChange={(e) => { handleDayChange(e, "sex") }} />}
                      />
                      <FormControlLabel
                        label="Sábado"
                        control={<Checkbox color="primary" checked={days[6]} onChange={(e) => { handleDayChange(e, "sab") }} />}
                      />
                      <FormControlLabel
                        label="Domingo"
                        control={<Checkbox color="primary" checked={days[0]} onChange={(e) => { handleDayChange(e, "dom") }} />}
                      />
                      <TextField
                        as={TextField}
                        label={"Horários"}
                        placeholder={"09:30,16:50,22:30"}
                        autoFocus
                        value={hours}
                        name="hours"
                        onChange={(e) => { setHours(e.target.value) }}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                      />
                    </Box>
                  }
                </div> */}
              </DialogContent>
              <DialogActions>
              <Button
                  onClick={handleClose}
                  color="secondary"
                  variant="outlined"
                >
                  {i18n.t("flows.flowsModal.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                  onClick={handleSubmit}
                  // disabled={useAutoFlow && crons.length === 0}
                >
                   { flowId
                    ? `${i18n.t("flows.flowsModal.save")}`
                    : `${i18n.t("flows.flowsModal.create")}`}
                </Button>
              </DialogActions>
          </Dialog>
      </div>
    );
};

export default FlowNodeModal;
