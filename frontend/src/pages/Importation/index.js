import React, { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "inline-flex",
    width: 200,
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const Importation = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");

  const renderOptionLabel = (option) => {
    return option;
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("importation.title")}</Title>
        <MainHeaderButtonsWrapper>
            <Autocomplete
                className={classes.root}
                options={['status1', 'status2']}
                getOptionLabel={renderOptionLabel}
                renderInput={(params) =>
                    <TextField
                        {...params}
                        label={i18n.t("importation.form.status")}
                        InputLabelProps={{ required: true}}
                    />
                }
            />
            <TextField
                onChange={(e) => { setDate(e.target.value) }}
                label={i18n.t("importation.form.date")}
                InputLabelProps={{ shrink: true, required: true }}
                type="date"
            />
            <Button
                variant="contained"
                color="primary"
            >
                {i18n.t("importation.buttons.import")}
            </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("importation.table.uploadDate")}</TableCell>
              <TableCell align="center">{i18n.t("importation.table.fileName")}</TableCell>
              <TableCell align="center">{i18n.t("importation.table.sentBy")}</TableCell>
              <TableCell align="center">{i18n.t("importation.table.numberOfRecords")}</TableCell>
              <TableCell align="center">{i18n.t("importation.table.status")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {loading}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Importation;
