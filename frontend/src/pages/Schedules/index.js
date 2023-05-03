import React, { useEffect, useReducer, useState } from "react";

import {
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  makeStyles,
} from "@material-ui/core";
import { Check, DeleteOutline, Edit } from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import ConfirmationModal from "../../components/ConfirmationModal";
import ScheduleModal from '../../components/ScheduleModal';
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import { i18n } from "../../translate/i18n";

const reducer = (state, action) => {
  switch(action.type) {
    case "LOAD_SCHEDULES": {
      const schedules = action.payload;
      const newSchedule = [];

      schedules.forEach((schedule) => {
        const scheduleIndex = state.findIndex((item) => item.id === schedule.id);
        if (scheduleIndex !== -1) {
          state[scheduleIndex] = schedule;
        } else {
          newSchedule.push(schedule);
        }
      });

      return [...state, ...newSchedule];
    }
    case "UPDATE_SCHEDULES": {
      const schedule = action.payload;
      const scheduleIndex = state.findIndex((item) => item?.id === schedule?.id);
      console.log({ schedule });
      console.log({ scheduleIndex });

      if (scheduleIndex !== -1) {
        state[scheduleIndex] = schedule;
        state.sort((a, b) => {
          if (a.date < b.date) return 1
          return -1
        });
        return [...state];
      } else {
        const newState = [schedule, ...state];
        newState.sort((a, b) => {
          if (a.date < b.date) return 1
          return -1
        });
        return newState;
      }
    }
    case "DELETE_SCHEDULES": {
      const scheduleId = action.payload;

      const scheduleIndex = state.findIndex((item) => item.id === scheduleId);
      if (scheduleIndex !== -1) {
        state.splice(scheduleIndex, 1);
      }
      return [...state];
    }
    case "RESET":
      return []
    default:
      return state;
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const Schedules = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [schedules, dispatch] = useReducer(reducer, []);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  console.log({ schedules });

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchSchedules = async () => {
        try {
          const { data } = await api.get("/schedules", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_SCHEDULES", payload: data.schedules });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchSchedules();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("schedules", (data) => {
      if (data.action === "update" || data.action === "create") {
        return dispatch({ type: "UPDATE_SCHEDULES", payload: data.schedule });
      };

      if (data.action === "delete") {
        return dispatch({
          type: "DELETE_SCHEDULES",
          payload: +data.scheduleId,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleToggleScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(isOpen => !isOpen);
  }

  const handleCloseConfirmationModal = () => {
    setDeletingSchedule(null);
    setConfirmModalOpen(false)
  }

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async () => {
    const scheduleId = deletingSchedule?.id;
    try {
      await api.delete(`/schedule/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingSchedule(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={`${i18n.t("schedules.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={handleDeleteSchedule}
      >
        {i18n.t("schedules.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ScheduleModal
          open={scheduleModalOpen}
          scheduleInfo={selectedSchedule}
          onClose={handleToggleScheduleModal}
          aria-labelledby="form-dialog-title"
      />
      <MainHeader>
        <Title>{i18n.t("schedules.title")}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("schedules.searchPlaceholder")}
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
            onClick={handleToggleScheduleModal}
          >
            {i18n.t("schedules.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("schedules.table.message")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("schedules.table.date")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("schedules.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell align="center">{schedule.body}</TableCell>
                  <TableCell align="center">{schedule.date}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      disabled={schedule.sent}
                      onClick={() => handleEditSchedule(schedule)}
                    >
                      {!schedule.sent ? <Edit /> : <Check />}
                    </IconButton>


                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingSchedule(schedule);
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={3} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Schedules;
