import React from "react";

import { Checkbox, ListItemText } from "@material-ui/core";
import Badge from "@material-ui/core/Badge";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { i18n } from "../../translate/i18n";

const TicketsQueueSelect = ({
  userQueues,
  selectedQueueIds = [],
  onChange,
}) => {
  const handleChange = (e) => {
    localStorage.setItem("selectedQueueIds", JSON.stringify(e.target.value));
    onChange(e.target.value);
  };

  return (
    <Badge
      badgeContent={selectedQueueIds?.length}
      max={99999}
      color="secondary"
      invisible={selectedQueueIds?.length === 0}
    >
      <div style={{ width: 160 }}>
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
            <MenuItem dense value={null}>
              <Checkbox
                style={{
                  color: "gray",
                }}
                size="small"
                color="primary"
                checked={selectedQueueIds.indexOf(null) > -1}
              />
              <ListItemText primary="Sin departamento" />
            </MenuItem>
          </Select>
        </FormControl>
      </div>
    </Badge>
  );
};

export default TicketsQueueSelect;
