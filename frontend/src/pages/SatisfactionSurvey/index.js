import React, { useContext, useEffect, useReducer, useState } from "react";

import openSocket from "../../services/socket-io";

import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";
import SatisfactionSurveyModal from "../../components/SatisfactionSurveyModal";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_SURVEY") {
    const blacklist = action.payload;
    const newContactBlacklist = [];

    blacklist.forEach((contactBlacklist) => {
      const contactBlacklistIndex = state.findIndex((q) => q.id === contactBlacklist.id);
      if (contactBlacklistIndex !== -1) {
        state[contactBlacklistIndex] = contactBlacklist;
      } else {
        newContactBlacklist.push(contactBlacklist);
      }
    });

    return [...state, ...newContactBlacklist];
  }

  if (action.type === "UPDATE_SURVEY") {
    const contactBlacklist = action.payload;
    const contactBlacklistIndex = state.findIndex((u) => u.id === contactBlacklist.id);

    if (contactBlacklistIndex !== -1) {
      state[contactBlacklistIndex] = contactBlacklist;
      return [...state];
    } else {
      return [contactBlacklist, ...state];
    }
  }

  if (action.type === "DELETE_SURVEY") {
    const contactBlacklistId = action.payload;
    const contactBlacklistIndex = state.findIndex((q) => q.id === contactBlacklistId);
    if (contactBlacklistIndex !== -1) {
      state.splice(contactBlacklistIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const SatisfactionSurvey = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);

  const [surveys, dispatch] = useReducer(reducer, []);
  const [count, setCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingSurvey, setDeletingSurvey] = useState(null);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
  }, []);

  useEffect(() => {
    setLoading(true); 
    const fetchSurveys = async () => {
      try {
        const { data } = await api.get("/satisfactionSurvey/", {
          params: { pageNumber }
        });
        
        dispatch({ type: "LOAD_SURVEY", payload: data.surveys });
        setCount(data.count);
        setHasMore(data.hasMore);
      } catch (err) {
        toastError(err);
      }
      setLoading(false);
    };
    fetchSurveys();
  }, [pageNumber]);

  useEffect(() => {
    const socket = openSocket();

    socket.on(`satisfactionSurvey${user.companyId}`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_SURVEY", payload: data.survey });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_SURVEY", payload: + data.surveyId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleOpenSurveyModal = () => {
    setSelectedSurvey(null);
    setSurveyModalOpen(true);
  };
  
  const handleCloseSurveyModal = () => {
    setSelectedSurvey(null);
    setSurveyModalOpen(false);
  };
  
  const handleEditSurvey = (survey) => {
    setSelectedSurvey(survey);
    setSurveyModalOpen(true);
  };

  const handleDeleteSurvey = async (surveyId) => {
    try {
      await api.delete(`/satisfactionSurvey/${surveyId}`);
      toast.success("Pesquisa deletada com sucesso.");
    } catch (err) {
      toastError(err);
    }

    setDeletingSurvey(null);
    setPageNumber(1);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={`Deletar: ${deletingSurvey && deletingSurvey.name}`}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteSurvey(deletingSurvey.id)}
      >
        {`Você tem certeza que deseja deletar essa pesquisa de satisfação?`}
      </ConfirmationModal>
      <SatisfactionSurveyModal 
        open={surveyModalOpen}
        onClose={handleCloseSurveyModal}
        surveyId={selectedSurvey && selectedSurvey.id}
      />
      <MainHeader>
        <Title>{"Pesquisas de Satisfação"}</Title>
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
              onClick={handleOpenSurveyModal}
            >
              {"Criar Nova Pesquisa"}
            </Button>
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{"Nome"}</TableCell>
              <TableCell align="center">{"Mensagem"}</TableCell>
              <TableCell align="center">{"Respostas"}</TableCell>
              <TableCell align="center">{"Ações"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {surveys && surveys.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell align="center">{survey.name}</TableCell>
                  <TableCell align="center">{survey.message}</TableCell>
                  <TableCell align="center">{survey.answers && JSON.parse(survey.answers).map((answer, index) => (
                      <React.Fragment key={index}>
                        {answer}<br />
                      </React.Fragment>
                    ))}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditSurvey(survey)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingSurvey(survey);
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
        <div
					style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}
				>
					<Button
						variant="outlined"
						onClick={() => setPageNumber(prevPageNumber => prevPageNumber - 1)}
						disabled={pageNumber === 1}
					>
						{"Página Anterior"}
					</Button>
					<Typography
						style={{ display: "inline-block", fontSize: "1.25rem" }}
					>
						{ pageNumber } / { Math.ceil(count / 10) }
					</Typography>
					<Button
						variant="outlined"
						onClick={() => setPageNumber(prevPageNumber => prevPageNumber + 1)}
						disabled={!hasMore}
					>
						{"Próxima Página"}
					</Button>
				</div>
      </Paper>
    </MainContainer>
  );
};

export default SatisfactionSurvey;
