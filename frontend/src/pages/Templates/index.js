import React, { useContext, useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import { useTranslation } from "react-i18next";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import TemplateModal from "../../components/TemplateModal";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

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
  multFieldLine: {
    width: 200,
    flexDirection: "column",
    display: "flex",
  },
  divStyle: {
    width: 300,
  },
  titleStyle: {
    marginLeft: 20,
    marginTop: 5,
  },
}));

const Templates = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [connection, setConnection] = useState("");
  const { whatsApps } = useContext(WhatsAppsContext);
  const [templates, setTemplates] = useState([]);

  const handleTemplateModal = () => {
    setTemplateModalOpen(true);
  };

  const handleCloseTemplateModal = () => {
    setTemplateModalOpen(false);
  };

  const handleChange = (e) => {
    setConnection(e.target.value);
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await api.get(`/whatsappTemplate/list/${connection}`);
        setTemplates(data);
      } catch (err) {
        toastError(err);
      }
    };
    if (connection) {
      fetchTemplates();
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);

  const getComponent = (components) => {
    let bodyText = "";

    components.every((component) => {
      if (component.type === "BODY") {
        bodyText = component.text;
        return false
      }
      return true;
    });

    return bodyText;
  }

  return (
    <MainContainer>
      <TemplateModal
        open={templateModalOpen}
        onClose={handleCloseTemplateModal}
        aria-labelledby="form-dialog-title"
      ></TemplateModal>
      <MainHeader>
        <div className={classes.titleStyle}>
          <Title>{i18n.t("templates.title")}</Title>
          <FormControl className={classes.multFieldLine}>
            <InputLabel id="demo-official-connections-label">
              {i18n.t("templates.buttons.connection")}
            </InputLabel>
            <Select
              className={classes.multFieldLine}
              labelId="demo-official-connections-label"
              id="demo-official-connections"
              value={connection}
              onChange={handleChange}
            >
              {whatsApps &&
                whatsApps.map((whats, index) => {
                  if (whats.official === true) {
                    return (
                      <MenuItem key={index} value={whats.id}>
                        {whats.name}
                      </MenuItem>
                    );
                  }return null
                })}
            </Select>
          </FormControl>
        </div>
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
                {i18n.t("templates.table.language")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("templates.table.status")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          <>
              {templates.map((template, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{template.name}</TableCell>
                  <TableCell align="center">{getComponent(template.components)}</TableCell>
                  <TableCell align="center">{template.category}</TableCell>
                  <TableCell align="center">{template.language}</TableCell>
                  <TableCell align="center">{template.status}</TableCell>
                </TableRow>
              ))}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Templates;
