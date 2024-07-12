import React from "react";

import { Checkbox, ListItemText } from "@material-ui/core";
import Badge from "@material-ui/core/Badge";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

const TicketsWhatsappSelect = ({
  userWhatsapps,
  selectedWhatsappIds = [],
  onChange,
}) => {
  const handleChange = (e) => {
    localStorage.setItem("selectedWhatsappIds", JSON.stringify(e.target.value));
    onChange(e.target.value);
  };

  return (
    <Badge
      badgeContent={selectedWhatsappIds?.length}
      max={99999}
      color="secondary"
      invisible={selectedWhatsappIds?.length === 0}
    >
      <div style={{ width: 140 }}>
        <FormControl fullWidth margin="dense">
          <Select
            multiple
            displayEmpty
            variant="outlined"
            value={selectedWhatsappIds}
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
            renderValue={() => "Conexiones"}
          >
            {userWhatsapps?.length > 0 &&
              userWhatsapps.map((whatsapp) => (
                <MenuItem dense key={whatsapp.id} value={whatsapp.id}>
                  <Checkbox
                    style={{
                      color: "black",
                    }}
                    size="small"
                    color="primary"
                    checked={selectedWhatsappIds.indexOf(whatsapp.id) > -1}
                  />
                  <ListItemText primary={whatsapp.name} />
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </div>
    </Badge>
  );
};

export default TicketsWhatsappSelect;
