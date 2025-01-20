import { Card, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";
import type { Theme } from "@mui/material/styles";

const useStyles = makeStyles((theme: Theme) => ({
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
