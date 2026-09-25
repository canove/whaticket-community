import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";

const useStyles = makeStyles((theme) => ({
  table: {
    [theme.breakpoints.down("xs")]: {
      display: "block",
      "& thead": {
        display: "none",
      },
      "& tbody": {
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(1),
      },
      "& tr": {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: theme.spacing(0.5, 1.25),
        padding: theme.spacing(1.75),
        backgroundColor: theme.palette.cards.background,
        border: theme.border.divider,
        borderRadius: theme.borderRadius.table,
      },
      "& .MuiTableCell-root": {
        ...theme.typography.subtitle2,
        flex: "1 1 0",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: theme.spacing(0.5),
        minWidth: 0,
        padding: 0,
        border: 0,
        textAlign: "left",
        overflowWrap: "anywhere",
        "& > *": {
          maxWidth: "100%",
        },
        "&:empty": {
          display: "none",
        },
      },
      "& .MuiTableCell-root:has(> .MuiAvatar-root)": {
        flex: "none",
      },
      "& .MuiTableCell-root[data-label]": {
        ...theme.typography.caption,
        flexBasis: "100%",
        color: theme.palette.text.secondary,
        "&::before": {
          content: "attr(data-label) ':'",
        },
      },
      "& .MuiTableCell-root:not([data-label]) + [data-label]": {
        marginTop: theme.spacing(0.75),
      },
      "& .MuiTableCell-root:last-child": {
        flexBasis: "100%",
        justifyContent: "flex-end",
        marginTop: theme.spacing(0.75),
        paddingTop: theme.spacing(1),
        borderTop: theme.border.divider,
      },
    },
  },
}));

const ResponsiveTable = ({ children }) => {
  const classes = useStyles();

  return (
    <Table size="small" className={classes.table}>
      {children}
    </Table>
  );
};

export default ResponsiveTable;
