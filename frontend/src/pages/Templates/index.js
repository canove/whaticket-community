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
import PhoneIcon from '@material-ui/icons/Phone';
import BindTemplateModal from "../../components/BindTemplateModal";

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

  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);

  const [selectedTemplate, setSelectedTemplate] = useState(true); 
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [bindTemplateModalOpen, setBindTemplateModalOpen] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/whatsappTemplate/');
        setTemplates(data);
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateModal = () => {
    setSelectedTemplate(null);
    setTemplateModalOpen(true);
  };

  const handleCloseTemplateModal = () => {
    setSelectedTemplate(null);
    setTemplateModalOpen(false);
  };

  const handleOpenBindTemplateModal = (template) => {
    setSelectedTemplate(template);
    setBindTemplateModalOpen(true);
  }

  const handleCloseBindTemplateModal = (template) => {
    setSelectedTemplate(null);
    setBindTemplateModalOpen(false);
  }

  return (
    <MainContainer>
      <TemplateModal
        open={templateModalOpen}
        onClose={handleCloseTemplateModal}
        aria-labelledby="form-dialog-title"
        templateName={selectedTemplate && selectedTemplate.name}
      />
      <BindTemplateModal 
        open={bindTemplateModalOpen}
        onClose={handleCloseBindTemplateModal}
        aria-labelledby="form-dialog-title"
        template={selectedTemplate}
      />
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleTemplateModal}
            >
              {i18n.t("templates.buttons.newTemplate")}
            </Button>
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                Nome
              </TableCell>
              <TableCell align="center">
                Categoria
              </TableCell>
              <TableCell align="center">
                Body
              </TableCell>
              <TableCell align="center">
                Footer
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
                    <TableCell align="center">{template.category}</TableCell>
                    <TableCell align="center">{template.body}</TableCell>
                    <TableCell align="center">{template.footer}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenBindTemplateModal(template)}
                      >
                        <PhoneIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {loading && <TableRowSkeleton columns={5} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Templates;
