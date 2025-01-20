import { styled } from "@mui/material/styles";

const MainHeaderButtonsWrapperStyled = styled("div")(({ theme }) => ({
  flex: "none",
  marginLeft: "auto",
  "& > *": {
    margin: theme.spacing(1),
  },
}));

import { ReactNode } from "react";

const MainHeaderButtonsWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <MainHeaderButtonsWrapperStyled>{children}</MainHeaderButtonsWrapperStyled>
  );
};

export default MainHeaderButtonsWrapper;
