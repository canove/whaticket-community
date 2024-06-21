import React from "react";

import { Checkbox, ListItemText } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

const TicketsTypeSelect = ({ selectedTypeIds = [], onChange }) => {
  const handleChange = (e) => {
    localStorage.setItem("selectedTypes", JSON.stringify(e.target.value));
    onChange(e.target.value);
  };

  return (
    <div style={{ width: 120, marginTop: -4 }}>
      <FormControl fullWidth margin="dense">
        <Select
          multiple
          displayEmpty
          variant="outlined"
          value={selectedTypeIds}
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
          renderValue={() => "Tipos Chats"}
        >
          {[
            { id: "individual", name: "Individuales" },
            { id: "group", name: "Grupos" },
          ].map((type) => (
            <MenuItem dense key={type.id} value={type.id}>
              <Checkbox
                style={{
                  color: "black",
                }}
                size="small"
                color="primary"
                checked={selectedTypeIds.indexOf(type.id) > -1}
              />
              <ListItemText primary={type.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default TicketsTypeSelect;
