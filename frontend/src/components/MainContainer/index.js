import React from "react";
import { styled } from '@mui/material/styles';
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

const StyledMainContainer = styled(Container)(() => ({
  flex: 1,
  padding: 0,
  height: "100%",
}));

const StyledContentWrapper = styled(Box)(() => ({
  height: "100%",
  overflowY: "hidden",
  display: "flex",
  flexDirection: "column",
}));

const MainContainer = ({ children }) => {
  return (
    <StyledMainContainer maxWidth={false}>
      <StyledContentWrapper>{children}</StyledContentWrapper>
    </StyledMainContainer>
  );
};

export default MainContainer;
