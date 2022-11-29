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
  IconButton,
  TextField,
} from "@material-ui/core";
import TemplateModal from "../../components/TemplateModal";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import { DeleteOutline } from "@material-ui/icons";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Autocomplete from "@material-ui/lab/Autocomplete";

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

const OfficialTemplates = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [connection, setConnection] = useState("");
  const { whatsApps } = useContext(WhatsAppsContext);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(true);
  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    templateName: "",
    open: false,
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(
    confirmationModalInitialState
  );

  const handleTemplateModal = () => {
    setSelectedTemplate(null);
    setTemplateModalOpen(true);
  };

  const handleCloseTemplateModal = () => {
    setSelectedTemplate(null);
    setTemplateModalOpen(false);
  };

  const handleChange = (e) => {
    setConnection(e.target.value);
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await api.get(
          `/whatsappTemplate/list/${connection.id}`
        );
        setTemplates(data);
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    };
    if (connection) {
      setLoading(true);
      fetchTemplates();
    } else {
      setTemplates([]);
    }
  }, [connection]);

  const getComponent = (components, type) => {
    let text = "";

    components.every((component) => {
      if (component.type === type) {
        text = component.text;
        return false;
      }
      return true;
    });

    return text;
  };
  const handleOpenConfirmationModal = (action, whatsAppId, templateName) => {
    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId,
        templateName: templateName,
      });
    }

    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "delete") {
      try {
        await api.delete(
          `/whatsappTemplate/delete/${confirmModalInfo.whatsAppId}/${confirmModalInfo.templateName}`
        );
        toast.success(i18n.t("templates.templateModal.delete"));
      } catch (err) {
        toastError(err);
      }
    }

    setConfirmModalInfo(confirmationModalInitialState);
  };

  const handleConnectionChange = (_, connection) => {
    if (connection) {
      setConnection(connection);
    } else {
      setConnection(null);
    }
  };

  return (
    <MainContainer>
      <TemplateModal
        open={templateModalOpen}
        onClose={handleCloseTemplateModal}
        aria-labelledby="form-dialog-title"
        templateName={selectedTemplate && selectedTemplate.name}
      ></TemplateModal>
      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>
      <MainHeader>
        <Title>{i18n.t("templates.title")}</Title>
        <MainHeaderButtonsWrapper>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "end",
            }}
          >
            <Autocomplete
              onChange={(e, newValue) => {
                handleConnectionChange(e, newValue);
              }}
              disablePortal
              id="combo-box-companies"
              options={whatsApps.map((whats) =>
                whats.official ? whats : null
              )}
              getOptionLabel={(option) => option.name}
              style={{ marginRight: "10px", width: "200px" }}
              renderInput={(params) => (
                <TextField {...params} label="Número" />
              )}
            />
            {/* <FormControl
              style={{
                marginRight: "10px",
                width: "200px",
              }}
            >
              <InputLabel id="demo-official-connections-label">
                {i18n.t("templates.buttons.connection")}
              </InputLabel>
              <Select
                labelId="demo-official-connections-label"
                id="demo-official-connections"
                value={connection}
                onChange={handleChange}
              >
                {whatsApps &&
                  whatsApps.map((whats) => {
                    if (whats.official === true) {
                      return (
                        <MenuItem key={whats.id} value={whats.id}>
                          {whats.name}
                        </MenuItem>
                      );
                    }
                    return null;
                  })}
              </Select>
            </FormControl> */}
            {/* <Button
              variant="contained"
              color="primary"
              onClick={handleTemplateModal}
            >
              {i18n.t("templates.buttons.newTemplate")}
            </Button> */}
          </div>
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
              <TableCell align="center">
                {i18n.t("templates.table.action")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {templates &&
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell align="center">{template.name}</TableCell>
                    <TableCell align="center">
                      {getComponent(template.components, "BODY")}
                    </TableCell>
                    <TableCell align="center">{template.category}</TableCell>
                    <TableCell align="center">{template.language}</TableCell>
                    <TableCell align="center">{template.status}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          handleOpenConfirmationModal(
                            "delete",
                            connection,
                            template.name
                          );
                        }}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {loading && <TableRowSkeleton columns={6} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default OfficialTemplates;
