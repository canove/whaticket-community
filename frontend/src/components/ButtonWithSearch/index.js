import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import { Button } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

const useStyles = makeStyles(theme => ({
  button: {
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
  drawer: {
    width: 300,
    padding: theme.spacing(2),
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
}));

const ButtonWithSearch = ({ open, loading, ...rest }) => {
  const classes = useStyles();

  
  return (
    <>
      <Button
        className={classes.button}
        disabled={loading}
        {...rest}
      >
        <SearchIcon size={24} />
      </Button>
    </>
  );
};

export default ButtonWithSearch;
