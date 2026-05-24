import React from "react";
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(() => ({
  header: {
    display: "flex",
    alignItems: "center",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #E5E9EF",
    backgroundColor: "#ffffff",
    gap: 12,
  },
}));

const MainHeader = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.header}>{children}</div>;
};

export default MainHeader;
