import { Card, Button } from "@mui/material";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";


const TicketHeaderStyled = styled(Card)(({ theme }) => ({
  display: "flex",
  backgroundColor: "#eee",
  flex: "none",
  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
  [theme.breakpoints.down("sm")]: {
    flexWrap: "wrap",
  },
}))

import { ReactNode } from "react";

interface TicketHeaderProps {
  loading: boolean;
  children: ReactNode;
}

const TicketHeader = ({ loading, children }: TicketHeaderProps) => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/tickets");
  };

  return (
    <>
      {loading ? (
        <TicketHeaderSkeleton />
      ) : (
        <TicketHeaderStyled>
          <Button color="primary" onClick={handleBack}>
            <ArrowBackIos />
          </Button>
          {children}
        </TicketHeaderStyled>
      )}
    </>
  );
};

export default TicketHeader;
