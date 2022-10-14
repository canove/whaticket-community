import React, { useContext, useEffect, useReducer, useState } from "react";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import { green, red } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";

import { useTranslation } from "react-i18next";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

import { Table, TableRow, Typography } from "@material-ui/core";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableContainer from "@material-ui/core/TableContainer";
import toastError from "../../errors/toastError";
import OndemandVideoIcon from '@material-ui/icons/OndemandVideo';
import DescriptionIcon from '@material-ui/icons/Description';
import TemplateTable from "../TemplateTable";

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

const reducer = (state, action) => {
  if (action.type === "LOAD_REPORTS") {
    const reports = action.payload;
    const newReports = [];

    reports.forEach((report) => {
      const reportIndex = state.findIndex((r) => r.id === report.id);
      if (reportIndex !== -1) {
        state[reportIndex] = report;
      } else {
        newReports.push(report);
      }
    });

    return [...state, ...newReports];
  }

  if (action.type === "UPDATE_REPORTS") {
    const report = action.payload;
    const reportIndex = state.findIndex((r) => r.id === report.id);

    if (reportIndex !== -1) {
      state[reportIndex] = report;
      return [...state];
    } else {
      return [report, ...state];
    }
  }

  if (action.type === "RESET") {
    return [];
  }
};

const RegisterFileModal = ({ open, onClose, fileId, integratedImportId }) => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [fileRegister, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [fileId, integratedImportId]);

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
      if (fileId) {
        await api.put(`/file/update/${fileId}/?status=${status}&userId=${user.id}`);
      }
      if (integratedImportId) {

      }
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  }

  useEffect(() => {
    const handleFilter = async () => {
      setLoading(true);
      try {
        setLoading(true);
        const { data } = await api.get(`/file/listRegister`, {
          params: { fileId, integratedImportId, pageNumber },
        });
        dispatch({ type: "LOAD_REPORTS", payload: data.reports });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };
    if (open) {
      handleFilter();
    }
  }, [open, fileId, integratedImportId, pageNumber]);

  useEffect(() => {
    const socket = openSocket();

    socket.on(`reports${user.companyId}`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_REPORTS", payload: data.reports });
      }
    });

    return () => {
      socket.disconnect();
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNextPage = () => {
    dispatch({ type: "RESET" });
    setPageNumber(pageNumber + 1);
  };

  const loadPreviousPage = () => {
    dispatch({ type: "RESET" });
    setPageNumber(pageNumber - 1);
  }

  const Body = (props) => {
    const { bodiesString } = props;
    const bodies = JSON.parse(bodiesString);

    let response = [];
    let index = 0;

    for (const body of bodies) {
      let value = body.value;

      if (body.type === "text") {
        response.push(<Typography key={index}>{value}</Typography>)
      }

      if (body.type === "contact") {
        response.push(<Typography key={index}>{value}</Typography>)
      }

      if (body.type === "image") {
        response.push(<img key={index} style={{display: "block", margin: "auto", maxWidth: "100px"}} src={value} alt={"upload"}/>)
      }

      if (body.type === "video") {
        response.push(<a key={index} style={{display: "block", margin: "auto"}} href={value} target='_blank' rel="noopener noreferrer"><OndemandVideoIcon fontSize="large"/></a>)
      }

      if (body.type === "audio") {
        response.push(<audio key={index} controls><source src={value} type="audio/ogg"></source></audio>)
      }

      if (body.type === "file") {
          response.push(<a key={index} style={{display: "block", margin: "auto"}} href={value} target='_blank' rel="noopener noreferrer"><DescriptionIcon fontSize="large"/></a>);
      }

      index++;
    }

    return (
      <>
        { response && response.map(res => res) }
      </>
    );
  }

  const isJsonString = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  const getMessage = (message) => {
    if (isJsonString(message)) {
      return <TemplateTable body={message} />
    }

    return message;
  }

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
        <DialogTitle id="form-dialog-title">{i18n.t("importation.registryModal.title")}
          <DialogContent dividers>
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
                            <TableCell align="center">{getMessage(item.message)}</TableCell>
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
            </DialogContent>
          </DialogTitle>
        <DialogActions>
          {pageNumber > 1 && (
            <>
              <Button
                onClick={loadPreviousPage}
              >
                {i18n.t("importation.registryModal.previousPage")}
              </Button>
            </>
          )}
          { hasMore && (
            <>
              <Button
                onClick={loadNextPage}
              >
                {i18n.t("importation.registryModal.nextPage")}
              </Button>
            </>
          )}
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
