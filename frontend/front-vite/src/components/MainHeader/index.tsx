import { styled } from "@mui/material/styles";
import type { ReactNode } from "react";

const ContactHeaderStyled = styled("div")({
  display: "flex",
  alignItems: "center",
  padding: "0px 6px 6px 6px",
});

interface MainHeaderProps {
  children: ReactNode;
}

const MainHeader = ({ children }: MainHeaderProps) => {
  return <ContactHeaderStyled>{children}</ContactHeaderStyled>;
};

export default MainHeader;
