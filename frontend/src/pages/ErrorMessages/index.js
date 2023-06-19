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
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { Send, Visibility } from "@material-ui/icons";
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
  tooltip: {
		backgroundColor: "#f5f5f9",
		color: "rgba(0, 0, 0, 0.87)",
		fontSize: theme.typography.pxToRem(14),
		border: "1px solid #dadde9",
		maxWidth: 450,
	},
	tooltipPopper: {
		textAlign: "center",
	},
}));

const CustomToolTip = ({ title, content, children }) => {
	const classes = useStyles();

	return (
    <Tooltip
      arrow
      classes={{
        tooltip: classes.tooltip,
        popper: classes.tooltipPopper,
      }}
      title={
        <React.Fragment>
          <Typography gutterBottom color="inherit">
            {title}
          </Typography>
        </React.Fragment>
      }
    >
      {children}
    </Tooltip>
	);
};

const ErrorMessages = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [resendingMessages, setResendMessages] = useState(false);

  const [date, setDate] = useState("");

  const [messages, setMessages] = useState([]);

  const handleFilter = async () => {
    setMessages([]);
    setLoading(true);

    try {
      const { data } = await api.get("/error/messages", {
        params: { date }
      });

      setMessages(data);
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
  }

  const handleResendMessages = async (messageIds = []) => {
    setResendMessages(true);

    try {
      await api.post("/error/messages/resend", { messageIds });

      await handleFilter();
    } catch (err) {
      toastError(err);
    }

    setResendMessages(false);
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>{"Mensagens com Erro"}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            onChange={(e) => { setDate(e.target.value) }}
            value={date}
            label={"Data"}
            InputLabelProps={{ shrink: true }}
            type="date"
          />
          { messages && messages.length > 0 &&
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => { handleResendMessages(messages.map(message => message.id)) }}
              disabled={resendingMessages}
            >
              {"Reenviar Todas Mensagens"}
            </Button>
          }
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleFilter}
          >
            {"Filtrar"}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{"ID da Conversa"}</TableCell>
              <TableCell align="center">{"Mensagem"}</TableCell>
              <TableCell align="center">{"URL da Mídia"}</TableCell>
              <TableCell align="center">{"Data"}</TableCell>
              <TableCell align="center">{"Ações"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {messages && messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell align="center">{message.ticketId}</TableCell>
                  <TableCell align="center">{message.body}</TableCell>
                  <TableCell align="center">{message.mediaUrl}</TableCell>
                  <TableCell align="center">{format(parseISO(message.createdAt), "dd/MM/yy HH:mm")}</TableCell>
                  <TableCell align="center">
                    <CustomToolTip title={"Reenviar mensagem"}>
											<IconButton
												size="small"
												onClick={() => handleResendMessages([message.id])}
											>
												<Send />
											</IconButton>
										</CustomToolTip>
                    <CustomToolTip title={"Abrir Conversa"}>
                      <IconButton
                        href={`tickets/${message.ticketId}`}
                        target="_blank"
                      >
                        <Visibility />
                      </IconButton>
                    </CustomToolTip>
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

export default ErrorMessages;
