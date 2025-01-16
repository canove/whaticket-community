
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(_theme => ({
	contactsHeader: {
		display: "flex",
		alignItems: "center",
		padding: "0px 6px 6px 6px",
	},
}));

import type { ReactNode } from "react";

interface MainHeaderProps {
  children: ReactNode;
}

const MainHeader = ({ children }: MainHeaderProps) => {
	const classes = useStyles();

	return <div className={classes.contactsHeader}>{children}</div>;
};

export default MainHeader;
