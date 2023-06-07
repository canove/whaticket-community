import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

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
}));

const TaskModal = ({ open, onClose, ticketId, taskId }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();
  const history = useHistory();

  const initialState = {
    description: "",
    dueDate: "",
  }
  const [task, setTask] = useState(initialState);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;

      try {
        const { data } = await api.get(`/task/${taskId}`);
        
        const dueDate = parseISO(data.dueDate);

        setTask(prevTask => ({ 
          ...prevTask, 
          ...data, 
          dueDate: `${format(dueDate, "yyyy-MM-dd")}T${format(dueDate, "HH:mm")}`
        }));
      } catch (err) {
        toastError(err);
      }
    }

    fetchTask();
  }, [ticketId, taskId, open]);

  const handleSubmit = async () => {
    setLoading(true);

    const taskData = { ...task, ticketId };

    try {
      if (taskId) {
        await api.put(`/task/${taskId}`, taskData);
      } else {
        await api.post("/task", taskData);
      }

      history.push(`/tickets/${ticketId}`);

      toast.success("Tarefa salva com sucesso.");

      handleClose();
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
	};

  const handleFinalize = async () => {
    setLoading(true);

    const taskData = { ticketId };

    try {
      await api.put(`/task/finalize/${taskId}`, taskData);

      toast.success("Tarefa finalizada com sucesso.");

      handleClose();
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
  }

  const handleClose = () => {
    setTask(initialState);
    onClose();
  };

  const handleTaskChange = (field, value) => {
    setTask(prevTask => ({ ...prevTask, [field]: value }));
  }

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {"Tarefa"}
        </DialogTitle>
        <DialogContent dividers>
          <div className={classes.multFieldLine}>
            <TextField
              label={"Descrição"}
              type="text"
              multiline
              minRows={3}
              maxRows={3}
              fullWidth
              name="description"
              variant="outlined"
              margin="dense"
              value={task.description}
              onChange={(e) => handleTaskChange("description", e.target.value)}
            />
          </div>
          <div className={classes.multFieldLine}>
            <TextField
              label={"Data de Expiração"}
              type="datetime-local"
              fullWidth
              name="dueDate"
              variant="outlined"
              margin="dense"
              value={task.dueDate}
              onChange={(e) => handleTaskChange("dueDate", e.target.value)}
              InputLabelProps={{ shrink: true, required: true }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            variant="outlined"
            disabled={loading}
          >
            {"Cancelar"}
          </Button>
          { taskId &&
            <Button
              color="primary"
              variant="contained"
              className={classes.btnWrapper}
              onClick={handleFinalize}
              disabled={loading}
            >
              {"Finalizar Tarefa"}
            </Button>
          }
          <Button
            type="submit"
            color="primary"
            variant="contained"
            className={classes.btnWrapper}
            onClick={handleSubmit}
            disabled={loading}
          >
            {"Salvar Tarefa"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TaskModal;
