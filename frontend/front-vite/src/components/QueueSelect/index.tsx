import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Chip from "@material-ui/core/Chip";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import type { Error } from "../../types/Error";

const useStyles = makeStyles((_theme) => ({
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
}));

interface QueueSelectProps {
  selectedQueueIds: number[];
  onChange: (queueIds: number[]) => void;
}

const QueueSelect: React.FC<QueueSelectProps> = ({
  selectedQueueIds,
  onChange,
}) => {
  const classes = useStyles();
  interface Queue {
    id: number;
    name: string;
    color: string;
  }

  const [queues, setQueues] = useState<Queue[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queue");
        setQueues(data);
      } catch (err) {
        toastError(err as Error);
      }
    })();
  }, []);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ marginTop: 6 }}>
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel>{i18n.t("queueSelect.inputLabel")}</InputLabel>
        <Select
          multiple
          labelWidth={60}
          value={selectedQueueIds}
          onChange={handleChange}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            getContentAnchorEl: null,
          }}
          renderValue={(selected: any) => (
            <div className={classes.chips}>
              {selected?.length > 0 &&
                selected.map((id: number) => {
                  const queue = queues.find((q) => q.id === id);
                  return queue ? (
                    <Chip
                      key={id}
                      style={{ backgroundColor: queue.color }}
                      variant="outlined"
                      label={queue.name}
                      className={classes.chip}
                    />
                  ) : null;
                })}
            </div>
          )}
        >
          {queues.map((queue) => (
            <MenuItem key={queue.id} value={queue.id}>
              {queue.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default QueueSelect;
