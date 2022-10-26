import React, { useContext, forwardRef, useEffect, useReducer, useState } from "react";

import openSocket from "../../services/socket-io";

import { Link as RouterLink } from "react-router-dom";

import {
  Button,
  IconButton,
  InputAdornment,
  ListItem,
  ListItemText,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";

import { Visibility } from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";
import FlowModal from "../../components/FlowModal";
import FileCopyIcon from '@material-ui/icons/FileCopy';
import FlowNodeModal from "../../components/FlowNodeModal";

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
  if (action.type === "LOAD_FLOW") {
    const flows = action.payload;
    const newFlow = [];

    flows.forEach((flow) => {
      const flowIndex = state.findIndex((f) => f.id === flow.id);
      if (flowIndex !== -1) {
        state[flowIndex] = flow;
      } else {
        newFlow.push(flow);
      }
    });

    return [...state, ...newFlow];
  }

  if (action.type === "UPDATE_FLOW") {
    const flow = action.payload;
    const flowIndex = state.findIndex((f) => f.id === flow.id);

    if (flowIndex !== -1) {
      state[flowIndex] = flow;
      return [...state];
    } else {
      return [flow, ...state];
    }
  }

  if (action.type === "DELETE_FLOW") {
    const flowId = action.payload;
    const flowIndex = state.findIndex((f) => f.id === flowId);
    if (flowIndex !== -1) {
      state.splice(flowIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Flows = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const { user } = useContext(AuthContext);

  const [flows, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [flowModalOpen, setFlowModalOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [deletingFlow, setDeletingFlow] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    dispatch({ type: "RESET" });
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const fetchFlows = async () => {
      try {
        const { data } = await api.get("/flows", {
          params: { searchParam, type: "bits" }
        });
        dispatch({ type: "LOAD_FLOW", payload: data });
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    };
    fetchFlows();
  }, [searchParam]);

  useEffect(() => {
    const socket = openSocket();

    socket.on(`flows${user.companyId}`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_FLOW", payload: data.flow });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_FLOW", payload: +data.flowId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const formatDate = (date) => {
    if (date) {
      return format(parseISO(date), "dd/MM/yyyy HH:mm");
    }

    return date;
  };

  const handleSearch = (e) => {
    setSearchParam(e.target.value.toLowerCase());
  };

  const handleOpenFlowModal = () => {
    // window.open('/createFlow', '_blank', 'noopener,noreferrer');
    setFlowModalOpen(true);
    setSelectedFlow(null);
  };

  const handleCloseFlowModal = () => {
    setFlowModalOpen(false);
    setSelectedFlow(null);
  };

  const handleEditFlow = (flow) => {
    setSelectedFlow(flow);
    setFlowModalOpen(true);
  };

  const handleCopyFlow = async (flow) => {
    // const flowData = {
    //   name: `${flow.name} copy`,
    //   type: 'bits'
    // }

    // try {
    //   await api.post(`/flows/`, flowData);
    //   toast.success(i18n.t("flows.confirmation.duplicate"));
    // } catch (err) {
    //   toastError(err);
    // }
  }

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedFlow(null);
  };

  const handleDeleteFlow = async (flowId) => {
    try {
        await api.delete(`/flows/${flowId}`);
        toast.success(i18n.t("flows.confirmation.delete"));
    } catch (err) {
        toastError(err);
    }
    setDeletingFlow(null);
  };
  
  // const getStatus = (status) => {
  //   if (status === "active") {
  //     return "Ativo";
  //   }

  //   if (status === "inactive") {
  //     return "Inativo";
  //   }

  //   return status;
  // }

  return (
    <MainContainer>
      <FlowNodeModal
        open={flowModalOpen}
        onClose={handleCloseFlowModal}
        aria-labelledby="form-dialog-title"
        flowId={selectedFlow && selectedFlow.id}
      />
      <ConfirmationModal
        title={i18n.t("flows.confirmation.title")}
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteFlow(deletingFlow.id)}
      >
        {i18n.t("flows.confirmation.confirmDelete")}
      </ConfirmationModal>
      <MainHeader>
        <Title>{i18n.t("flows.title")}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("flows.buttons.search")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenFlowModal}
          >
            {i18n.t("flows.buttons.create")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("flows.grid.name")}</TableCell>
              <TableCell align="center">{i18n.t("flows.grid.createdAt")}</TableCell>
              <TableCell align="center">{i18n.t("flows.grid.updatedAt")}</TableCell>
              <TableCell align="center">{i18n.t("flows.grid.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {flows &&
                flows.map((flow) => {
                  return (
                    <TableRow key={flow.id}>
                      <TableCell align="center">{flow.name}</TableCell>
                      <TableCell align="center">
                        {formatDate(flow.createdAt)}
                      </TableCell>
                      <TableCell align="center">
                        {formatDate(flow.updatedAt)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          component={forwardRef((itemProps, ref) => (<RouterLink to={`/CreateFlow/${flow.id}`} ref={ref} {...itemProps} />))}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditFlow(flow)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyFlow(flow)}
                        >
                          <FileCopyIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDeletingFlow(flow);
                            setConfirmModalOpen(true);
                          }}
                        >
                          <DeleteOutline />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Flows;
