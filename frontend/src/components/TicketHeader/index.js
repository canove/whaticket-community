import React, { useEffect, useState } from "react";
import { Card, Button, TextField, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import SearchIcon from "@material-ui/icons/Search";
import { useHistory } from "react-router-dom";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  ticketHeader: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#eee",
    flex: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    padding: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      flexWrap: "wrap",
    },
  },
  searchField: {
    marginLeft: theme.spacing(2),
    flexGrow: 1,
  },
}));

const TicketHeader = ({ loading, children, onSearch }) => {
  const classes = useStyles();
  const history = useHistory();
  const handleBack = () => {
    history.push("/tickets");
  };
  const [searchTerm, setsearchTerm] = useState("");
  const ticketId = history.location.pathname.split("/")[2];

  const searchMessage = () => {
    api.get(`/messages/${ticketId}/${searchTerm}`).then((response) => {
      console.log(response.data);
    });
  };

  return (
    <>
      {loading ? (
        <TicketHeaderSkeleton />
      ) : (
        <Card square className={classes.ticketHeader}>
          <Button color="primary" onClick={handleBack}>
            <ArrowBackIos />
          </Button>
          <TextField
            className={classes.searchField}
            placeholder="Buscar mensagens..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setsearchTerm(e.target.value)}
          />
          <IconButton color="primary" onClick={searchMessage}>
            <SearchIcon />
          </IconButton>
          {children}
        </Card>
      )}
    </>
  );
};

export default TicketHeader;
