import { Card, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  ticketHeader: {
    display: "flex",
    backgroundColor: "#eee",
    flex: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    [theme.breakpoints.down("sm")]: {
      flexWrap: "wrap",
    },
  },
}));

import { ReactNode } from "react";

interface TicketHeaderProps {
  loading: boolean;
  children: ReactNode;
}

const TicketHeader = ({ loading, children }: TicketHeaderProps) => {
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
            <ArrowBackIos />
          </Button>
          {children}
        </Card>
      )}
    </>
  );
};

export default TicketHeader;
