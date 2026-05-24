import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Checkbox, ListItemText } from "@mui/material";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(() => ({
  select: {
    height: 32,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12.5,
    color: "#0A0F1E",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#E5E9EF",
      borderRadius: 11,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#25D366",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#25D366",
      borderWidth: 1.5,
    },
    "& .MuiSelect-select": {
      paddingTop: 0,
      paddingBottom: 0,
      display: "flex",
      alignItems: "center",
      height: "100%",
    },
  },
  placeholder: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12.5,
    color: "#9BA3B0",
  },
  menuItem: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 13,
    color: "#0A0F1E",
    padding: "4px 12px",
  },
}));

const TicketsQueueSelect = ({ userQueues, selectedQueueIds = [], onChange }) => {
  const classes = useStyles();

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ width: 110 }}>
      <FormControl fullWidth>
        <Select
          multiple
          displayEmpty
          variant="outlined"
          value={selectedQueueIds}
          onChange={handleChange}
          className={classes.select}
          MenuProps={{
            anchorOrigin: { vertical: "bottom", horizontal: "left" },
            transformOrigin: { vertical: "top", horizontal: "left" },
            getContentAnchorEl: null,
            PaperProps: {
              style: {
                borderRadius: 11,
                border: "1px solid #E5E9EF",
                boxShadow: "0 4px 16px rgba(10,15,30,0.08)",
                marginTop: 4,
              },
            },
          }}
          renderValue={() => (
            <span className={classes.placeholder}>
              {i18n.t("ticketsQueueSelect.placeholder")}
            </span>
          )}
        >
          {userQueues?.length > 0 &&
            userQueues.map((queue) => (
              <MenuItem dense key={queue.id} value={queue.id} className={classes.menuItem}>
                <Checkbox
                  style={{ color: queue.color }}
                  size="small"
                  checked={selectedQueueIds.indexOf(queue.id) > -1}
                />
                <ListItemText
                  primary={queue.name}
                  primaryTypographyProps={{
                    style: {
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      fontSize: 13,
                    },
                  }}
                />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default TicketsQueueSelect;
