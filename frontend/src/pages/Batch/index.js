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

  useEffect(() => {
    dispatch({ type: "RESET" });
  }, []);

  useEffect(() => {
    setLoading(true); 
    
    const fetchBatches = async () => {
      try {
        const { data } = await api.get("/batch/");
        dispatch({ type: "LOAD_BATCHES", payload: data });
      } catch (err) {
        toastError(err);
      }
      setLoading(false);
    };

    fetchBatches();
  }, []);

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
              <TableCell align="center">{i18n.t("batch.interaction")}</TableCell>
              <TableCell align="center">{i18n.t("batch.createdAt")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {batches && batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell align="center">{batch.batchId}</TableCell>
                  <TableCell align="center">{batch.batchQuantity}</TableCell>
                  <TableCell align="center">{(batch.registers && batch.registers.length > 0 && batch.registers[0].processedQuantity) ? batch.registers[0].processedQuantity : 0}</TableCell>
                  <TableCell align="center">{(batch.registers && batch.registers.length > 0 && batch.registers[0].interactionQuantity) ? batch.registers[0].interactionQuantity : 0}</TableCell>
                  <TableCell align="center">{format(parseISO(batch.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
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
