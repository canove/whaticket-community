import React, { useContext, useEffect, useReducer, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

import openSocket from "../../services/socket-io";

import {
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
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
import { DeleteOutline, Edit, Visibility } from "@material-ui/icons";
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

const statusTranslation = {
  "open": "Em Atendimento",
  "pending": "Aguardando",
  "closed": "Finalizado"
}

const Supervisor = () => {
  const classes = useStyles();
  const history = useHistory();

  const search = useLocation().search;
  const searchParams = new URLSearchParams(search);

  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  
  const [info, setInfo] = useState([]);
  const [users, setUsers] = useState([]);
  const [queues, setQueues] = useState([]);
  const [categories, setCategories] = useState([]);

  const [tab, setTab] = useState("queue");

  const [categoryId, setCategoryId] = useState("");
  const [queueId, setQueueId] = useState("");
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  
  const [pageNumber, setPageNumber] = useState(1);
  const [count, setCount] = useState(0);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const loadSearchParams = () => {
      const newTab = searchParams.get("tab");
      const newQueueId = searchParams.get("queueId");
      const newUserId = searchParams.get("userId");
      const newStatus = searchParams.get("status");
      const newPageNumber = searchParams.get("pageNumber");
      const newCategoryId = searchParams.get("categoryId");

      if (newTab !== tab) setTab(newTab ?? "queue");
      if (newQueueId !== queueId) setQueueId(newQueueId ?? "");
      if (newUserId !== userId) setUserId(newUserId ?? "");
      if (newStatus !== status) setStatus(newStatus ?? "");
      if (newPageNumber !== pageNumber) setPageNumber(newPageNumber ?? "");
      if (newCategoryId !== categoryId) setCategoryId(newCategoryId ?? "");
    }

    loadSearchParams();
  }, [searchParams]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users/list");
        setUsers(data);
      } catch (err) {
        toastError(err);
      }
    }

    const fetchQueues = async () => {
      try {
        const { data } = await api.get("/queue");
				setQueues(data);
      } catch (err) {
        toastError(err);
      }
    }

    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/category");
        setCategories(data);
      } catch (err) {
        toastError(err);
      }
    }

    fetchUsers();
    fetchQueues();
    fetchCategories();
  }, []);

  useEffect(() => {
    setLoading(true);
    const delayDebounce = setTimeout(() => {
      const fetchInfo = async () => {
        try {
          const { data } = await api.get("/supervisor", {
            params: { tab, queueId, userId, status, pageNumber, categoryId }
          });

          if (tab === "ticket") {
            setCount(data.count);
            setInfo(data.tickets);
          } else {
            setInfo(data);
          }

        } catch (err) {
          toastError(err);
        }
        setLoading(false);
      }

      fetchInfo();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [tab, queueId, categoryId, status, userId, pageNumber]);

  const refetchInfo = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/supervisor", {
        params: { tab, queueId, userId, status, pageNumber, categoryId }
      });

      if (tab === "ticket") {
        setCount(data.count);
        setInfo(data.tickets);
      } else {
        setInfo(data);
      }

    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  }

  const handleInfoClick = ({ queueId, userId, status, tab, categoryId }) => {
    setInfo([]);
    setTab(tab);
    setQueueId(queueId);
    setUserId(userId);
    setStatus(status);
    setCategoryId(categoryId);
    setPageNumber(1);

    history.push({
      pathname: '/Supervisor',
      search: "?" + new URLSearchParams({ 
        queueId: queueId ?? "", 
        userId: userId ?? "", 
        status: status ?? "", 
        categoryId: categoryId ?? "", 
        pageNumber: 1,
        tab: tab ?? "queue" 
      }).toString()
    });
  }

  const handleUserIdChange = (e) => {
    setUserId(e.target.value);
    setPageNumber(1);

    history.push({
      pathname: '/Supervisor',
      search: "?" + new URLSearchParams({ 
        queueId: queueId ?? "",
        userId: e.target.value ?? "",
        status: status ?? "",
        categoryId: categoryId ?? "",
        pageNumber: 1,
        tab: tab ?? "queue",
      }).toString()
    });
  } 

  const handleQueueIdChange = (e) => {
    setQueueId(e.target.value);
    setPageNumber(1);

    history.push({
      pathname: '/Supervisor',
      search: "?" + new URLSearchParams({ 
        queueId: e.target.value ?? "",
        userId: userId ?? "",
        status: status ?? "",
        categoryId: categoryId ?? "",
        pageNumber: 1,
        tab: tab ?? "queue",
      }).toString()
    });
  } 

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPageNumber(1);

    history.push({
      pathname: '/Supervisor',
      search: "?" + new URLSearchParams({ 
        queueId: queueId ?? "",
        userId: userId ?? "",
        status: e.target.value ?? "",
        categoryId: categoryId ?? "",
        pageNumber: 1,
        tab: tab ?? "queue",
      }).toString()
    });
  } 

  const handleCategoryIdChange = (e) => {
    setCategoryId(e.target.value);
    setPageNumber(1);

    history.push({
      pathname: '/Supervisor',
      search: "?" + new URLSearchParams({ 
        queueId: queueId ?? "",
        userId: userId ?? "",
        status: status ?? "",
        categoryId: e.target.value ?? "",
        pageNumber: 1,
        tab: tab ?? "queue",
      }).toString()
    });
  } 

  const handleTabChange = (e) => {
    setInfo([]);
    setTab(e.target.value);
    setQueueId("");
    setUserId("");
    setStatus("");
    setCategoryId("");
    setPageNumber(1);

    history.push({
      pathname: '/Supervisor',
      search: "?" + new URLSearchParams({ 
        queueId: "", 
        userId: "", 
        status: "", 
        categoryId: "",
        pageNumber: 1,
        tab: e.target.value ?? "queue" 
      }).toString()
    });
  }

  const formatTime = (milliseconds) => {
    let seconds = milliseconds / 1000;

    let minutes = Math.floor(seconds / 60);
    seconds = Math.floor((seconds / 60 - minutes) * 60);

    let hours = Math.floor(minutes / 60);
    minutes = Math.floor((minutes / 60 - hours) * 60);

    let secondsString = seconds.toString();
    let minutesString = minutes.toString();
    let hoursString = hours.toString();

    if (secondsString.length === 1) {
      secondsString = `0${secondsString}`;
    }

    if (minutesString.length === 1) {
      minutesString = `0${minutesString}`;
    }

    if (hoursString.length === 1) {
      hoursString = `0${hoursString}`;
    }

    if (hoursString === "NaN" || minutesString === "NaN" || secondsString === "NaN") return "00:00:00";

    return `${hoursString}:${minutesString}:${secondsString}`;
  };

  const getUserServiceTime = (hists) => {
    let currentID = 0;

    const createdHist = hists.find(h => h.id > currentID);
    currentID = createdHist.id;

    const finalizedHist = hists.find(h => h.id > currentID);

    const createdAt = createdHist.ticketCreatedAt ?? createdHist.acceptedAt ?? createdHist.reopenedAt ?? createdHist.transferedAt;
    const finalizedAt = finalizedHist.finalizedAt ?? finalizedHist.transferedAt;

    if (!createdAt || !finalizedAt) return null;

    const createdAtDate = new Date(createdAt);
    const finalizedAtDate = new Date(finalizedAt);

    const serviceTime = finalizedAtDate.getTime() - createdAtDate.getTime();

    return serviceTime;
  }

  const processHistorics = (historics = []) => {
    if (!historics || historics.length === 0) return "--:--:--";

    let tickets = [];

    for (const historic of historics) {
      const ticketIndex = tickets.findIndex(ticket => ticket.ticketId === historic.ticketId);

      if (ticketIndex === -1) {
        tickets.push({
          ticketId: historic.ticketId,
          historics: [historic]
        });
      } else {
        const newTicket = {
          ticketId: tickets[ticketIndex].ticketId,
          historics: [...tickets[ticketIndex].historics, historic]
        }
  
        tickets[ticketIndex] = newTicket;
      }
    }

    const ticketsServiceTime = [];

    for (const ticket of tickets) {
      const hists = ticket.historics;

      if (hists.length < 2) continue;

      if (hists.length === 2) {
        let serviceTime = 0;

        serviceTime = getUserServiceTime(hists);

        ticketsServiceTime.push(serviceTime);
        continue;
      }

      if (hists.length > 2) {
        const histsArray = [];

        for (let i = 0; i < hists.length; i += 2) {
          histsArray.push(hists.slice(i, i + 2));
        }

        for (const newHists of histsArray) {
          if (newHists.length % 2 !== 0) continue;

          let serviceTime = 0;

          serviceTime = getUserServiceTime(newHists);

          if (serviceTime === null) continue;

          ticketsServiceTime.push(serviceTime);
          continue;
        }
      }
    }

    let itemCount = 0;
    let milliseconds = 0;
    for (const time of ticketsServiceTime) {
      milliseconds += time;
      itemCount++;
    }

    const averageServiceTime = milliseconds / itemCount;

    return formatTime(averageServiceTime);
  }

  const formatLastSentMessageDate = (time) => {
    const formattedTime = formatTime(time);
    const [hours_string, minutes_string, seconds_string] = formattedTime.split(":");

    const hours = parseInt(hours_string);
    const minutes = parseInt(minutes_string);
    const seconds = parseInt(seconds_string);

    const days = Math.floor(hours / 24);

    let result = "???";

    if (days >= 1) {
      result = `${days} dia(s) atrás.`;
    } else if (hours) {
      result = `${hours} hora(s) atrás.`;
    } else if (minutes) {
      result = `${minutes} minuto(s) atrás.`;
    } else if (seconds) {
      result = `${seconds} segundo(s) atrás.`;
    }

    return result;
  }

  const handlePreviousPage = () => {
    const currentPageNumber = pageNumber;
    setPageNumber(currentPageNumber - 1);

    history.push({
      pathname: '/Supervisor',
      search: "?" + new URLSearchParams({ 
        queueId: queueId ?? "",
        userId: userId ?? "",
        status: status ?? "",
        categoryId: categoryId ?? "",
        pageNumber: currentPageNumber - 1,
        tab: tab ?? "queue",
      }).toString()
    });
  }

  const handleNextPage = () => {
    const currentPageNumber = parseInt(pageNumber);
    setPageNumber(currentPageNumber + 1);

    history.push({
      pathname: '/Supervisor',
      search: "?" + new URLSearchParams({ 
        queueId: queueId ?? "",
        userId: userId ?? "",
        status: status ?? "",
        categoryId: categoryId ?? "",
        pageNumber: currentPageNumber + 1,
        tab: tab ?? "queue",
      }).toString()
    });
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>{"Supervisor"}</Title>
        <IconButton size="small" onClick={refetchInfo} disabled={loading}>
          <GrUpdate />
        </IconButton>
        <MainHeaderButtonsWrapper>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <FormControl style={{ display: "inline-flex", width: "150px", marginLeft: "8px" }}>
              <InputLabel>{"Aba"}</InputLabel>
              <Select
                value={tab}
                defaultValue="queue"
                onChange={(e) => handleTabChange(e)}
              >
                <MenuItem value={"queue"}>{"Fila"}</MenuItem>
                <MenuItem value={"user"}>{"Operador"}</MenuItem>
                <MenuItem value={"ticket"}>{"Tickets"}</MenuItem>
              </Select>
            </FormControl>
            { tab === "ticket" && 
              <>
                <FormControl style={{ display: "inline-flex", width: "150px", marginLeft: "8px" }}>
                  <InputLabel>{"Usuário"}</InputLabel>
                  <Select
                    value={userId}
                    onChange={(e) => handleUserIdChange(e)}
                  >
                    <MenuItem value={""}>{"Nenhum"}</MenuItem>
                    <MenuItem value={"NO_USER"}>{"SEM USER"}</MenuItem>
                    { users && users.map(user => (
                      <MenuItem value={user.id} key={user.id}>{user.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl style={{ display: "inline-flex", width: "150px", marginLeft: "8px" }}>
                  <InputLabel>{"Fila"}</InputLabel>
                  <Select
                    value={queueId}
                    onChange={(e) => handleQueueIdChange(e)}
                  >
                    <MenuItem value={""}>{"Nenhum"}</MenuItem>
                    <MenuItem value={"NO_QUEUE"}>{"SEM FILA"}</MenuItem>
                    { queues && queues.map(queue => (
                      <MenuItem value={queue.id} key={queue.id}>{queue.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl style={{ display: "inline-flex", width: "150px", marginLeft: "8px" }}>
                  <InputLabel>{"Categoria"}</InputLabel>
                  <Select
                    value={categoryId}
                    onChange={(e) => handleCategoryIdChange(e)}
                  >
                    <MenuItem value={""}>{"Nenhum"}</MenuItem>
                    <MenuItem value={"NO_CATEGORY"}>{"SEM CATEGORIA"}</MenuItem>
                    { categories && categories.map(category => (
                      <MenuItem value={category.id} key={category.id}>{category.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl style={{ display: "inline-flex", width: "150px", marginLeft: "8px" }}>
                  <InputLabel>{"Status"}</InputLabel>
                  <Select
                    value={status}
                    onChange={(e) => handleStatusChange(e)}
                  >
                    <MenuItem value={""}>{"Nenhum"}</MenuItem>
                    <MenuItem value={"pending"}>{"Aguardando"}</MenuItem>
                    <MenuItem value={"open"}>{"Em Atendimento"}</MenuItem>
                    <MenuItem value={"closed"}>{"Finalizado"}</MenuItem>
                  </Select>
                </FormControl>
              </>
            }
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        { tab === "queue" &&
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="left">{"Fila"}</TableCell>
                <TableCell align="center">{"Limite"}</TableCell>
                <TableCell align="center">{"Tickets em Espera"}</TableCell>
                <TableCell align="center">{"Tickets em Atendimento"}</TableCell>
                <TableCell align="center">{"Tickets Finalizadas"}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {!loading && info && info.map((queue) => (
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
                      <span>
                        {queue.limit ?? "SEM LIMITE"}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span
                        style={{ cursor: "pointer" }} 
                        onClick={() => { 
                          handleInfoClick({ 
                            tab: "ticket", 
                            queueId: queue.id,
                            status: "pending",
                            userId: null,
                          });
                        }}
                      >
                        {queue.pending_tickets ?? 0}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span
                        style={{ cursor: "pointer" }} 
                        onClick={() => { 
                          handleInfoClick({ 
                            tab: "ticket", 
                            queueId: queue.id, 
                            status: "open",
                            userId: null,
                          });
                        }}
                      >
                        {queue.open_tickets ?? 0}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span
                        style={{ cursor: "pointer" }} 
                        onClick={() => { 
                          handleInfoClick({ 
                            tab: "ticket", 
                            queueId: queue.id, 
                            status: "closed",
                            userId: null,
                          });
                        }}
                      >
                        {queue.closed_tickets ?? 0}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton columns={5} />}
              </>
            </TableBody>
          </Table>
        }
        { tab === "user" &&
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="left">{"User"}</TableCell>
                <TableCell align="center">{"Tickets em Espera"}</TableCell>
                <TableCell align="center">{"Tickets em Atendimento"}</TableCell>
                <TableCell align="center">{"Tickets Finalizadas"}</TableCell>
                <TableCell align="center">{"Tempo Médio de Atendimento"}</TableCell>
                <TableCell align="center">{"Tempo Ocioso"}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {!loading && info && info.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell align="left">
                      {user.name}
                    </TableCell>
                    <TableCell align="center">
                      <span
                        style={{ cursor: "pointer" }} 
                        onClick={() => { 
                          handleInfoClick({ 
                            tab: "ticket", 
                            status: "pending",
                            userId: user.id,
                            queueId: null,
                          });
                        }}
                      >
                        {user.pending_tickets ?? 0}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span
                        style={{ cursor: "pointer" }} 
                        onClick={() => { 
                          handleInfoClick({ 
                            tab: "ticket", 
                            status: "open",
                            userId: user.id,
                            queueId: null,
                          });
                        }}
                      >
                        {user.open_tickets ?? 0}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span
                        style={{ cursor: "pointer" }} 
                        onClick={() => { 
                          handleInfoClick({ 
                            tab: "ticket", 
                            status: "closed",
                            userId: user.id,
                            queueId: null,
                          });
                        }}
                      >
                        {user.closed_tickets ?? 0}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span>
                        {processHistorics(user.ticketHistorics)}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span>
                        {formatLastSentMessageDate(user.lastSentMessage)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton columns={6} />}
              </>
            </TableBody>
          </Table>
        }
        { tab === "ticket" &&
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">{"ID do Ticket"}</TableCell>
                  <TableCell align="center">{"Fila"}</TableCell>
                  <TableCell align="center">{"User"}</TableCell>
                  <TableCell align="center">{"Status"}</TableCell>
                  <TableCell align="center">{"Categoria"}</TableCell>
                  <TableCell align="center">{"Mensagens Enviadas"}</TableCell>
                  <TableCell align="center">{"Mensagens Recebidas"}</TableCell>
                  <TableCell align="center">{"Data da Última Mensagem Enviada"}</TableCell>
                  <TableCell align="center">{"Data da Última Mensagem Recebida"}</TableCell>
                  <TableCell align="center">{"Ações"}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <>
                  {!loading && info && info.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell align="center">
                        <span>
                          {ticket.id}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <span
                          style={{ cursor: "pointer" }} 
                          onClick={() => { 
                            handleInfoClick({ 
                              tab: "ticket", 
                              queueId: ticket.queue ? ticket.queue.id : "NO_QUEUE", 
                              status: null,
                              userId: null,
                            });
                          }}
                        >
                          {ticket.queue ? ticket.queue.name : "SEM FILA"}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <span
                          style={{ cursor: "pointer" }} 
                          onClick={() => { 
                            handleInfoClick({ 
                              tab: "ticket", 
                              userId: ticket.user ? ticket.user.id : "NO_USER", 
                              status: null,
                              queueId: null,
                            });
                          }}
                        >
                          {ticket.user ? ticket.user.name : "SEM USER"}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <span
                          style={{ cursor: "pointer" }} 
                          onClick={() => { 
                            handleInfoClick({
                              tab: "ticket",
                              queueId: null, 
                              userId: null,
                              status: ticket.status,
                            });
                          }}
                        >
                          {statusTranslation[ticket.status]}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <span
                          style={{ cursor: "pointer" }} 
                          onClick={() => { 
                            handleInfoClick({
                              tab: "ticket",
                              queueId: null, 
                              userId: null,
                              status: null,
                              categoryId: ticket.category ? ticket.category.id : "NO_CATEGORY"
                            });
                          }}
                        >
                          {ticket.category ? ticket.category.name : "SEM CATEGORIA"}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <span>
                          {ticket.sent_messages ?? 0}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <span>
                          {ticket.received_messages ?? 0}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <span>
                          {ticket.lastSentMessage ? format(parseISO(ticket.lastSentMessage), "dd/MM/yy HH:mm") : ""}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <span>
                          {ticket.lastReceivedMessage ? format(parseISO(ticket.lastReceivedMessage), "dd/MM/yy HH:mm") : ""}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => { history.push(`tickets/${ticket.id}`); }}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {loading && <TableRowSkeleton columns={10} />}
                </>
              </TableBody>
            </Table>
           <div
              style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}
            >
              <Button
                variant="outlined"
                onClick={handlePreviousPage}
                disabled={ pageNumber == 1}
              >
                {"Página Anterior"}
              </Button>
              <Typography
                style={{ display: "inline-block", fontSize: "1.25rem" }}
              >
                { pageNumber } / { Math.ceil(count / 20) }
              </Typography>
              <Button
                variant="outlined"
                onClick={handleNextPage}
                disabled={ pageNumber >= Math.ceil(count / 20) }
              >
                {"Próxima Página"}
              </Button>
            </div>
          </>
        }
      </Paper>
    </MainContainer>
  );
};

export default Supervisor;
