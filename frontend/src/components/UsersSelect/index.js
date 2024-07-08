import Chip from "@material-ui/core/Chip";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
}));

const UsersSelect = ({ selectedUserIds, onChange }) => {
  const classes = useStyles();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/users");
        setUsers(data.users);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel>Usuarios</InputLabel>
        <Select
          multiple
          labelWidth={60}
          value={selectedUserIds}
          onChange={handleChange}
          variant="standard"
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
          renderValue={(selected) => (
            <div className={classes.chips}>
              {selected?.length > 0 &&
                selected.map((id) => {
                  const user = users.find((q) => q.id === id);
                  return user ? (
                    <Chip
                      key={id}
                      variant="outlined"
                      label={user.name}
                      className={classes.chip}
                    />
                  ) : null;
                })}
            </div>
          )}
        >
          {users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default UsersSelect;
