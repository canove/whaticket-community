import React from "react";
import { styled } from '@mui/material/styles';
import Box from "@mui/material/Box";

const StyledHeaderContainer = styled(Box)(() => ({
	display: "flex",
	alignItems: "center",
	padding: "0px 6px 6px 6px",
}));

const MainHeader = ({ children }) => {
	return <StyledHeaderContainer>{children}</StyledHeaderContainer>;
};

export default MainHeader;
