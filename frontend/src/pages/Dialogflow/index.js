import { format, parseISO } from "date-fns";
import React, { useReducer, useState } from "react";

import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@material-ui/core";

import { DeleteOutline, Edit } from "@material-ui/icons";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import DialogflowModal from "../../components/DialogflowModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import useLoadData from "../Queues/useLoadData.js";
import useSocket from "../Queues/useSocket";

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
  if (action.type === "LOAD_DIALOGFLOWS") {
    const dialoflows = action.payload;
    const newDialogflows = [];

    dialoflows.forEach((dialogflow) => {
      const dialogflowIndex = state.findIndex((q) => q.id === dialogflow.id);
      if (dialogflowIndex !== -1) {
        state[dialogflowIndex] = dialogflow;
      } else {
        newDialogflows.push(dialogflow);
      }
    });

    return [...state, ...newDialogflows];
  }

  if (action.type === "UPDATE_DIALOGFLOWS") {
    const dialogflow = action.payload;
    const dialogflowIndex = state.findIndex((u) => u.id === dialogflow.id);

    if (dialogflowIndex !== -1) {
      state[dialogflowIndex] = dialogflow;
      return [...state];
    } else {
      return [dialogflow, ...state];
    }
  }

  if (action.type === "DELETE_DIALOGFLOW") {
    const dialogflowId = action.payload;
    const dialogflowIndex = state.findIndex((q) => q.id === dialogflowId);
    if (dialogflowIndex !== -1) {
      state.splice(dialogflowIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Dialogflows = () => {
  const classes = useStyles();

  const [dialogflows, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [dialogflowModalOpen, setDialogflowModalOpen] = useState(false);
  const [selectedDialogflow, setSelectedDialogflow] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useLoadData(setLoading, dispatch, '/dialogflow', 'LOAD_DIALOGFLOWS');
  useSocket(dispatch, 'dialogflow', 'UPDATE_DIALOGFLOWS', 'DELETE_DIALOGFLOW', 'dialogflow', 'dialogflowId');

  const handleOpenDialogflowModal = () => {
    setDialogflowModalOpen(true);
    setSelectedDialogflow(null);
  };

  const handleCloseDialogflowModal = () => {
    setDialogflowModalOpen(false);
    setSelectedDialogflow(null);
  };

  const handleEditDialogflow = (dialogflow) => {
    setSelectedDialogflow(dialogflow);
    setDialogflowModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedDialogflow(null);
  };

  const handleDeleteDialogflow = async (dialogflowId) => {
    try {
      await api.delete(`/dialogflow/${dialogflowId}`);
      toast.success(i18n.t("Dialogflow deleted successfully!"));
    } catch (err) {
      toastError(err);
    }
    setSelectedDialogflow(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selectedDialogflow &&
          `${i18n.t("dialogflows.confirmationModal.deleteTitle")} ${
            selectedDialogflow.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteDialogflow(selectedDialogflow.id)}
      >
        {i18n.t("dialogflows.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <DialogflowModal
        open={dialogflowModalOpen}
        onClose={handleCloseDialogflowModal}
        dialogflowId={selectedDialogflow?.id}
      />
      <MainHeader>
        <Title>{i18n.t("dialogflows.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialogflowModal}
          >
            {i18n.t("dialogflows.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("dialogflows.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("dialogflows.table.projectName")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("dialogflows.table.language")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("dialogflows.table.lastUpdate")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("dialogflows.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {dialogflows.map((dialogflow) => (
                <TableRow key={dialogflow.id}>
                  <TableCell align="center">{dialogflow.name}</TableCell>
                  <TableCell align="center">{ dialogflow.projectName}</TableCell>
                  <TableCell align="center">{dialogflow.language}</TableCell>
                  <TableCell align="center">
												{format(parseISO(dialogflow.updatedAt), "dd/MM/yy HH:mm")}
											</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditDialogflow(dialogflow)}
                    ><Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedDialogflow(dialogflow);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Dialogflows;
