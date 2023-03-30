import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },

  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },

  multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
		alignItems: "center",
	},
}));

const ResolveModal = ({ open, onClose, ticketId, userId }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [surveys, setSurveys] = useState([]);

  const [canUseSurvey, setCanUseSurvey] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("none");
  const [selectedSurvey, setSelectedSurvey] = useState("none");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/category');
        setCategories(data)
        } catch (err) {
        toastError(err);
      }
    };

    const fetchSurveys = async () => {
      try {
        const { data } = await api.get('/satisfactionSurvey', {
          params: { limit: -1 }
        });
        setSurveys(data.surveys);
      } catch (err) {
        toastError(err);
      }
    }

    const checkCanUseSurveys = async () => {
      try {
        const { data } = await api.get('/menus/check', {
          params: { menuName: "Satisfaction Survey" }
        });

        setCanUseSurvey(data);
      } catch (err) {
        setCanUseSurvey(false);
      }
    }

    checkCanUseSurveys();
    fetchCategories();
    fetchSurveys();
  }, [open]);

  const handleResolveTicket = async (userId, categoryId, surveyId) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticketId}`, {
        status: "closed",
        userId: userId || null,
        categoryId: categoryId === "none" ? null : categoryId,
        surveyId: surveyId === "none" ? null : surveyId, 
      });

      history.push("/tickets");
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
    handleClose();
	};

  const handleClose = () => {
    onClose();
    setSelectedCategory("none");
    setSelectedSurvey("none");
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSurveyChange = (e) => {
    setSelectedSurvey(e.target.value);
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {"Resolver o Ticket"}
        </DialogTitle>
        <DialogContent dividers>
          <div className={classes.multFieldLine}>
            <FormControl
              variant="outlined"
              margin="dense"
              fullWidth
            >
              <InputLabel>{"Categoria"}</InputLabel>
              <Select
                variant="outlined"
                label="Categoria"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e)}
                fullWidth
              >
                <MenuItem value={"none"}>{i18n.t("category.categoryModal.none")}</MenuItem>
                {categories.length > 0 && categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          { canUseSurvey &&
            <div className={classes.multFieldLine}>
              <FormControl
                variant="outlined"
                margin="dense"
                fullWidth
              >
                <InputLabel>{"Pesquisa de Satisfação"}</InputLabel>
                <Select
                  variant="outlined"
                  label="Pesquisa de Satisfação"
                  value={selectedSurvey}
                  onChange={(e) => handleSurveyChange(e)}
                  fullWidth
                >
                  <MenuItem value={"none"}>{"Nenhuma"}</MenuItem>
                  {surveys.length > 0 && surveys.map((survey) => (
                    <MenuItem key={survey.id} value={survey.id}>{survey.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          }
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            variant="outlined"
            disabled={loading}
          >
            {i18n.t("category.categoryModal.cancel")}
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            className={classes.btnWrapper}
            onClick={() => handleResolveTicket(userId, selectedCategory, selectedSurvey)}
            disabled={loading}
          >
            {i18n.t("Resolver")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ResolveModal;
