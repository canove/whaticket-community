import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Checkbox, ListItemText } from "@material-ui/core";
import { i18n } from "../../translate/i18n";

interface Queue {
  id: number;
  name: string;
  color: string;
}

interface TicketsQueueSelectProps {
  userQueues: Queue[];
  selectedQueueIds?: number[];
  onChange: (queueIds: number[]) => void;
  style?: React.CSSProperties;
}

const TicketsQueueSelect: React.FC<TicketsQueueSelectProps> = ({
  userQueues,
  selectedQueueIds = [],
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    onChange(e.target.value as number[]);
  };

  return (
    <div style={{ width: 120, marginTop: -4 }}>
      <FormControl fullWidth margin="dense">
        <Select
          multiple
          displayEmpty
          variant="outlined"
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
          renderValue={() => i18n.t("ticketsQueueSelect.placeholder")}
        >
          {userQueues?.length > 0 &&
            userQueues.map((queue) => (
              <MenuItem dense key={queue.id} value={queue.id}>
                <Checkbox
                  style={{
                    color: queue.color,
                  }}
                  size="small"
                  color="primary"
                  checked={selectedQueueIds.indexOf(queue.id) > -1}
                />
                <ListItemText primary={queue.name} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default TicketsQueueSelect;
