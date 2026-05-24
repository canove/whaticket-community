import React from "react";

import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
	MainHeaderButtonsWrapper: {
		flex: "none",
		marginLeft: "auto",
		"& > *": {
			margin: theme.spacing(1),
		},
	},
}));

const MainHeaderButtonsWrapper = ({ children }) => {
	const classes = useStyles();

	return <div className={classes.MainHeaderButtonsWrapper}>{children}</div>;
};

export default MainHeaderButtonsWrapper;
