import React from "react";

import { Card, Button } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import { ChevronLeft as ArrowBackIos } from "lucide-react";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  ticketHeader: {
    display: "flex",
    backgroundColor: "#ffffff",
    flex: "none",
    borderBottom: "1px solid #E5E9EF",
    [theme.breakpoints.down('md')]: {
      flexWrap: "wrap",
    },
  },
}));

const TicketHeader = ({ loading, children }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/tickets");
  };

  return (
    <>
      {loading ? (
        <TicketHeaderSkeleton />
      ) : (
        <Card square className={classes.ticketHeader}>
          <Button color="primary" onClick={handleBack}>
            <ArrowBackIos size={20} />
          </Button>
          {children}
        </Card>
      )}
    </>
  );
};

export default TicketHeader;
