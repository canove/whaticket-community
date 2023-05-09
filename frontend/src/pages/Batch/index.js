import React, { useContext, useEffect, useReducer, useState } from "react";

import openSocket from "../../services/socket-io";

import {
  Button,
  CircularProgress,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import CategoryModal from "../../components/CategoryModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";
import { GrUpdate } from "react-icons/gr";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_BATCHES") {
    const batches = action.payload;
    const newBatches = [];

    batches.forEach((batch) => {
      const batchIndex = state.findIndex((q) => q.id === batch.id);
      if (batchIndex !== -1) {
        state[batchIndex] = batch;
      } else {
        newBatches.push(batch);
      }
    });

    return [...state, ...newBatches];
  }

  if (action.type === "UPDATE_BATCH") {
    const batch = action.payload;
    const batchIndex = state.findIndex((u) => u.id === batch.id);

    if (batchIndex !== -1) {
      state[batchIndex] = batch;
      return [...state];
    } else {
      return [batch, ...state];
    }
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Batch = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const { user } = useContext(AuthContext);

  const [batches, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [refreshingBatch, setRefreshingBatch] = useState({});

  useEffect(() => {
    dispatch({ type: "RESET" });
  }, []);

  useEffect(() => {
    setLoading(true); 
    
    const fetchBatches = async () => {
      try {
        const { data } = await api.get("/batch/");
        dispatch({ type: "LOAD_BATCHES", payload: data });

        let refreshing = {};
        for (const batch of data) {
          if (batch.batchQuantity === batch.processedQuantity) break;

          refreshing = {...refreshing, [batch.id]: false };
        }
        setRefreshingBatch(refreshing);
      } catch (err) {
        toastError(err);
      }
      setLoading(false);
    };

    fetchBatches();
  }, []);

  useEffect(() => {
    const socket = openSocket();

    socket.on(`batch${user.companyId}`, (data) => {
      if (data.action === "update") {
        dispatch({ type: "UPDATE_BATCH", payload: data.batch });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const refreshBatch = async (batchId) => {
    setRefreshingBatch(prevRefresing => ({ ...prevRefresing, [batchId]: true }));

    try {
      await api.put(`/batch/${batchId}`);
    } catch (err) {
      toastError(err);
    }

    setRefreshingBatch(prevRefresing => ({ ...prevRefresing, [batchId]: false }));
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("batch.title")}</Title>
        <MainHeaderButtonsWrapper>

        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("batch.id")}</TableCell>
              <TableCell align="center">{i18n.t("batch.total")}</TableCell>
              <TableCell align="center">{i18n.t("batch.processed")}</TableCell>
              <TableCell align="center">{i18n.t("batch.isBillet")}</TableCell>
              <TableCell align="center">{i18n.t("batch.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {batches && batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell align="center">{batch.batchId}</TableCell>
                  <TableCell align="center">{batch.batchQuantity}</TableCell>
                  <TableCell align="center">{batch.processedQuantity ?? 0}</TableCell>
                  <TableCell align="center">{batch.isBillet ? i18n.t("batch.yes") : i18n.t("batch.no")}</TableCell>
                  <TableCell align="center">
                    {refreshingBatch.hasOwnProperty(batch.id) &&
                      <IconButton size="small" onClick={() => refreshBatch(batch.id)} disabled={refreshingBatch[batch.id]}>
                        {!refreshingBatch[batch.id] && <GrUpdate />}
                        {refreshingBatch[batch.id] && <CircularProgress />}
                      </IconButton>
                    }
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={5} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Batch;
