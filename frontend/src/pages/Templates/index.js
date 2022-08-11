import React, { useEffect, useReducer, useState } from "react";

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

import { useTranslation } from "react-i18next";
import ImportModal from "../../components/ImportModal";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { parseISO, format } from "date-fns";
import { IconButton } from "@material-ui/core";
import { Done, Visibility } from "@material-ui/icons";
import TemplateModal from "../../components/TemplateModal";

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

const Templates = () => {
    const classes = useStyles();
    const { i18n } = useTranslation();
    const [templateModalOpen, setTemplateModalOpen] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState("");

  const handleTemplateModal = (fileId) => {
    setSelectedFileId(fileId)
    setTemplateModalOpen(true);
  };

  const handleCloseTemplateModal = () => {
    setTemplateModalOpen(false);
  };


  return (
    <MainContainer>
      <TemplateModal
        open={templateModalOpen}
        onClose={handleCloseTemplateModal}
        aria-labelledby="form-dialog-title"
      >
      </TemplateModal>
      <MainHeader>
        <Title>{i18n.t("templates.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleTemplateModal}
            >
            {i18n.t("templates.buttons.newTemplate")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("templates.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("templates.table.preview")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("templates.table.category")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("templates.table.classification")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("templates.table.language")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("templates.table.status")}
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </Paper>
    </MainContainer>
  );
}

export default Templates;
