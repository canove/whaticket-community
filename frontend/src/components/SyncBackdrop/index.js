import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

export default function SyncBackdrop({ open }) {
  const classes = useStyles();

  return (
    <div>
      <Backdrop className={classes.backdrop} open={open}>
        <h3>Sincronizando mensajes de la conexión</h3>
        <p>No interactue mucho con el dispositivo para evitar problemas</p>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
