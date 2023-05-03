import React, { useEffect, useRef } from "react";

import {
  Dialog,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";

import { i18n } from "../../translate/i18n";
import ScheduleInput from '../ScheduleInput';

const useStyles = makeStyles((theme) => ({
  root: {
    flexWrap: "wrap",
  },

  textField: {
    marginRight: theme.spacing(1),
    width: "100%",
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

  textScheduleContainer: {
    width: "100%",
  },
}));

const ScheduleModal = ({
  open,
  onClose,
  scheduleInfo,
  ticket
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {scheduleInfo?.id
            ? `${i18n.t("scheduleModal.title.edit")}`
            : `${i18n.t("scheduleModal.title.add")}`}
        </DialogTitle>
        <ScheduleInput scheduleInfo={scheduleInfo} handleCloseModal={handleClose} ticket={ticket} />
      </Dialog>
    </div>
  );
};

export default ScheduleModal;
