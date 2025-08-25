import React from "react";

import makeStyles from '@mui/styles/makeStyles';
import { green } from "@mui/material/colors";
import { CircularProgress, Button } from "@mui/material";

const useStyles = makeStyles(theme => ({
	button: {
		position: "relative",
	},

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
}));

const ButtonWithSpinner = ({ loading, children, ...rest }) => {
	const classes = useStyles();

	return (
		<Button className={classes.button} disabled={loading} {...rest}>
			{children}
			{loading && (
				<CircularProgress size={24} className={classes.buttonProgress} />
			)}
		</Button>
	);
};

export default ButtonWithSpinner;
