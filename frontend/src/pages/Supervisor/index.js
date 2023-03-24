import React, { useContext, useEffect, useReducer, useState } from "react";

import openSocket from "../../services/socket-io";

import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";

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

const Supervisor = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  
  const [info, setInfo] = useState([]);

  const [type, setType] = useState("queue");

  const [queueId, setQueueId] = useState("");
  const [status, setStatus] = useState("");

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchInfo = async () => {
        try {
          const { data } = await api.get("/supervisor", {
            params: { type, queueId, status }
          });
          console.log(data);
          setInfo(data);
        } catch (err) {
          toastError(err);
        }
      }

      fetchInfo();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [type, queueId, status]);

  const handleInfoClick = ({ queueId, status, type }) => {
    setInfo([]);
    setType(type);
    setQueueId(queueId);
    setStatus(status);
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>{"Supervisor"}</Title>
        <MainHeaderButtonsWrapper>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        { type === "queue" &&
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="left">{"Fila"}</TableCell>
                <TableCell align="center">{"Conversas em Espera"}</TableCell>
                <TableCell align="center">{"Conversas em Atendimento"}</TableCell>
                <TableCell align="center">{"Conversas Finalizadas"}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {info && info.map((queue) => (
                  <TableRow key={queue.id}>
                    <TableCell align="left">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "start",
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            marginRight: 5,
                            alignSelf: "center",
                            // borderRadius: "100%",
                            backgroundColor: queue.color,
                            border: queue.color ? null : "1px solid black",
                          }}
                        />
                        <Typography>{queue.name}</Typography>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <span
                        style={{ cursor: "pointer" }} 
                        onClick={() => { 
                          handleInfoClick({ 
                            type: "queue-ticket", 
                            queueId: queue.id, 
                            status: "pending",
                          });
                        }}
                      >
                        {queue.pending_tickets}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span
                        style={{ cursor: "pointer" }} 
                        onClick={() => { 
                          handleInfoClick({ 
                            type: "queue-ticket", 
                            queueId: queue.id, 
                            status: "open",
                          });
                        }}
                      >
                        {queue.open_tickets}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span
                        style={{ cursor: "pointer" }} 
                        onClick={() => { 
                          handleInfoClick({ 
                            type: "queue-ticket", 
                            queueId: queue.id, 
                            status: "closed",
                          });
                        }}
                      >
                        {queue.closed_tickets}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton columns={4} />}
              </>
            </TableBody>
          </Table>
        }
        { type === "queue-ticket" &&
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">{"ID da Conversa"}</TableCell>
                <TableCell align="center">{"Fila"}</TableCell>
                <TableCell align="center">{"Status"}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {info && info.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell align="center">
                      <span
                        style={{ cursor: "pointer" }} 
                        onClick={() => { 

                        }}
                      >
                        {ticket.id}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span
                        style={{ cursor: "pointer" }} 
                        onClick={() => { 
                          // handleInfoClick({ 
                          //   type: "queue-ticket", 
                          //   queueId: ticket.queue ? ticket.queue.id : "NO_QUEUE", 
                          //   status: null,
                          // });
                        }}
                      >
                        {ticket.queue ? ticket.queue.name : "SEM FILA"}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span
                        style={{ cursor: "pointer" }} 
                        onClick={() => { 
                          // handleInfoClick({
                          //   type: "queue-ticket",
                          //   queueId: null, 
                          //   status: ticket.status,
                          // });
                        }}
                      >
                        {ticket.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton columns={3} />}
              </>
            </TableBody>
          </Table>
        }
      </Paper>
    </MainContainer>
  );
};

export default Supervisor;
