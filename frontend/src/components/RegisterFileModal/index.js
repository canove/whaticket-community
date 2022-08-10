import React, { useContext, useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { green, red } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";

import { useTranslation } from "react-i18next";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Table, TableRow, Divider } from "@material-ui/core";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableContainer from "@material-ui/core/TableContainer";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  btnWrapper: {
    position: "relative",
  },

  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
    marginBottom: 20,
    marginTop: 20,
    alignItems: "center",
  },

  buttonRed: {
    color: red[300],
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const RegisterFileModal = ({ open, onClose, fileId }) => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [fileRegister, setFileRegister] = useState();

  const handleClose = () => {
    onClose();
  };

  const handleApprove = async () => {
    await updateFileStatus(4);
    handleClose();
  }

  const handleRefuse = async () => {
    await updateFileStatus(7);
    handleClose();
  }

  const updateFileStatus = async (status) => {
    setLoading(true);
    try {
      setLoading(true);
      const { data } = await api.put(`/file/update/${fileId}/?status=${status}&userId=${user.id}`);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }

  useEffect(() => {
    const handleFilter = async () => {
      setLoading(true);
      try {
        setLoading(true);
        const { data } = await api.get(`/file/listRegister?fileId=${fileId}`);
        setFileRegister(data)
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };
    handleFilter();
  }, [fileId]);

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
        <DialogTitle id="form-dialog-title">{i18n.t("importation.registryModal.title")}
          <Divider></Divider>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">{i18n.t("importation.registryModal.id")}</TableCell>
                  <TableCell align="center">{i18n.t("importation.registryModal.name")}</TableCell>
                  <TableCell align="center">{i18n.t("importation.registryModal.template")}</TableCell>
                  <TableCell align="center">{i18n.t("importation.registryModal.message")}</TableCell>
                  <TableCell align="center">{i18n.t("importation.registryModal.phoneNumber")}</TableCell>
                  <TableCell align="center">{i18n.t("importation.registryModal.documentNumber")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              <>
                {fileRegister && fileRegister.map((item, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell align="center">{item.id}</TableCell>
                      <TableCell align="center">{item.name}</TableCell>
                      <TableCell align="center">{item.template}</TableCell>
                      <TableCell align="center">{item.message}</TableCell>
                      <TableCell align="center">{item.phoneNumber}</TableCell>
                      <TableCell align="center">{item.documentNumber}</TableCell>
                    </TableRow>
                  );
                  })}
                {loading}
              </>
            </TableBody>
            </Table>
          </TableContainer>
        </DialogTitle>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            variant="outlined"
            disabled={loading}
          >
            {i18n.t("importation.registryModal.cancel")}
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            className={classes.btnWrapper}
            onClick={handleRefuse}
            disabled={loading}
          >
            {i18n.t("importation.registryModal.refuse")}
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            className={classes.btnWrapper}
            onClick={handleApprove}
            disabled={loading}
          >
            {i18n.t("importation.registryModal.approve")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RegisterFileModal;
