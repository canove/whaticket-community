import React from "react";

import { Button, Card } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import { useHistory } from "react-router-dom";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";

const useStyles = makeStyles((theme) => ({
  ticketHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eee",
    flex: "none",
    // borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    [theme.breakpoints.down("sm")]: {
      flexWrap: "wrap",
    },
    boxShadow: "none",
  },
}));

const TicketHeader = ({ loading, children, withArrow = true }) => {
  const classes = useStyles();
  const history = useHistory();
  const handleBack = () => {
    history.push("/tickets");
  };

  return (
    <>
      {loading ? (
        <TicketHeaderSkeleton />
      ) : (
        <Card square className={classes.ticketHeader}>
          {withArrow && (
            <Button color="primary" onClick={handleBack}>
              <ArrowBackIos />
            </Button>
          )}
          {children}
        </Card>
      )}
    </>
  );
};

export default TicketHeader;
