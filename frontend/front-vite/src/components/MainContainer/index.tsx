import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";

const MainContainerStyled = styled(Container)({
  flex: 1,
  // padding: theme.spacing(2),
  // height: `calc(100% - 48px)`,
  padding: 0,
  height: "100%",
});

const ContentWrapperStyled = styled("div")({
  height: "100%",
  overflowY: "hidden",
  display: "flex",
  flexDirection: "column",
});

import type { ReactNode } from "react";

interface MainContainerProps {
  children: ReactNode;
  className?: string;
}

const MainContainer = ({ children }: MainContainerProps) => {
  return (
    <MainContainerStyled maxWidth={false}>
      <ContentWrapperStyled>{children}</ContentWrapperStyled>
    </MainContainerStyled>
  );
};

export default MainContainer;
