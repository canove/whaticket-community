import React, { useState } from "react";

import Dialog from "@material-ui/core/Dialog";

import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";

import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import TicketListItem from "../TicketListItem";

import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
  collapseColumn: {
    width: 40, // Ajusta este valor según tus necesidades
  },
});

function Row(props) {
  const { row, handleClose } = props;
  const [open, setOpen] = useState(false);
  const classes = useRowStyles();

  // console.log(group);

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell className={classes.collapseColumn}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell className={classes.CollapseColumn}>
          <Avatar src={row?.profilePicUrl} />
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              {row.tickets.map((ticket) => (
                <div onClick={handleClose} style={{ overflow: "hidden" }}>
                  <TicketListItem ticket={ticket} key={ticket.id} />
                </div>
              ))}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const NumberGroupsModal = ({ modalOpen, onClose, number, groups }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <DialogTitle id="form-dialog-title">Grupos de {number}</DialogTitle>
      <DialogContent dividers style={{ width: "900px" }}>
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableBody>
              {groups.map((group) => (
                <Row key={group.name} row={group} handleClose={handleClose} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default NumberGroupsModal;
