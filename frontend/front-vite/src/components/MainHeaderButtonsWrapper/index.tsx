import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(_theme => ({
	MainHeaderButtonsWrapper: {
		flex: "none",
		marginLeft: "auto",
		"& > *": {
			margin: _theme.spacing(1),
		},
	},
}));

import { ReactNode } from "react";

const MainHeaderButtonsWrapper = ({ children }: { children: ReactNode }) => {
	const classes = useStyles();

	return <div className={classes.MainHeaderButtonsWrapper}>{children}</div>;
};

export default MainHeaderButtonsWrapper;
