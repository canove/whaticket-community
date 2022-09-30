import React, { useContext, useEffect, useReducer, useState } from "react";

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
  IconButton,
  TextField,
  InputAdornment,
  Typography,
} from "@material-ui/core";
import TemplatesDataModal from "../../components/TemplatesDataModal";
import { DeleteOutline } from "@material-ui/icons";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import EditIcon from "@material-ui/icons/Edit";
import openSocket from "../../services/socket-io";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import SearchIcon from "@material-ui/icons/Search";
import { format, parseISO } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";
import OndemandVideoIcon from '@material-ui/icons/OndemandVideo';
import DescriptionIcon from '@material-ui/icons/Description';
import TemplateTable from "../../components/TemplateTable";

const reducer = (state, action) => {
  if (action.type === "LOAD_TEMPLATES") {
    const templates = action.payload;
    const newTemplates = [];

    templates.forEach((template) => {
      const templateIndex = state.findIndex((t) => t.id === template.id);
      if (templateIndex !== -1) {
        state[templateIndex] = template;
      } else {
        newTemplates.push(template);
      }
    });

    return [...state, ...newTemplates];
  }

  if (action.type === "UPDATE_TEMPLATES") {
    const template = action.payload;
    const templateIndex = state.findIndex((t) => t.id === template.id);

    if (templateIndex !== -1) {
      state[templateIndex] = template;
      return [...state];
    } else {
      return [template, ...state];
    }
  }

  if (action.type === "DELETE_TEMPLATE") {
    const templatesId = action.payload;

    const templateIndex = state.findIndex((t) => t.id === templatesId);
    if (templateIndex !== -1) {
      state.splice(templateIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

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
    display: "flex"
  },
  divStyle: {
    width: 300,
  },
  titleStyle: {
    marginLeft: 20,
    marginTop: 5,
  },
}));

const TemplatesData = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [templates, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTemplates = async () => {
        try {
          const { data } = await api.get("/TemplatesData/list/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_TEMPLATES", payload: data.templates });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchTemplates();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = openSocket();
    socket.on(`templates${user.companyId}`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TEMPLATES", payload: data.template });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_TEMPLATE", payload: + data.templateId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleTemplateModal = () => {
    setSelectedTemplates(null);
    setTemplateModalOpen(true);
  };

  const handleCloseTemplateModal = () => {
    setSelectedTemplates(null);
    setTemplateModalOpen(false);
  };

  const handleEditTemplates = (template) => {
    setSelectedTemplates(template);
    setTemplateModalOpen(true);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleSearch = (e) => {
    setSearchParam(e.target.value.toLowerCase());
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleDeleteTemplate = async (templatesId) => {
    try {
        await api.delete(`/TemplatesData/delete/${templatesId}`);
        toast.success(i18n.t("templatesData.modalConfirm.successDelete"));
      } catch (err) {
        toastError(err);
      }
    setDeletingTemplate(null);
    setSearchParam("");
    setPageNumber(1);
  };

  return (
    <MainContainer>
      <TemplatesDataModal
        open={templateModalOpen}
        onClose={handleCloseTemplateModal}
        aria-labelledby="form-dialog-title"
        templatesId={selectedTemplates && selectedTemplates.id}
      >
      </TemplatesDataModal>
        <ConfirmationModal
            title={
            deletingTemplate &&
            'Deletar Template'}
            open={confirmModalOpen}
            onClose={setConfirmModalOpen}
            onConfirm={() => handleDeleteTemplate(deletingTemplate.id)}
        >
          {i18n.t("templatesData.modalConfirm.delete")}
      </ConfirmationModal>
      <MainHeader>
        <div className={classes.titleStyle}>
          <Title>{i18n.t("templatesData.title")}</Title>
        </div>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("templatesData.buttons.search")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleTemplateModal}
          >
            {i18n.t("templatesData.buttons.newTemplate")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("templatesData.grid.name")}</TableCell>
              <TableCell align="center">{i18n.t("templatesData.grid.text")}</TableCell>
              <TableCell align="center">{i18n.t("templatesData.grid.footer")}</TableCell>
              <TableCell align="center">{i18n.t("templatesData.grid.createdAt")}</TableCell>
              <TableCell align="center">{i18n.t("templatesData.grid.updateAt")}</TableCell>
              <TableCell align="center">{i18n.t("templatesData.grid.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {templates && templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell align="center">{template.name}</TableCell>
                    <TableCell align="center">
                      <TemplateTable body={template.text} />
                    </TableCell>
                    <TableCell align="center">{template.footer}</TableCell>
                    <TableCell align="center">
                      {format(parseISO(template.createdAt), "dd/MM/yy HH:mm")}
                    </TableCell>
                    <TableCell align="center">
                      {format(parseISO(template.updatedAt), "dd/MM/yy HH:mm")}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleEditTemplates(template)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setDeletingTemplate(template);
                          setConfirmModalOpen(true);
                        }}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default TemplatesData;
