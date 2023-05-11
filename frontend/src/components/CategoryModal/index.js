import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  TextField,
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";

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

const CategoryModal = ({ open, onClose, categoryId }) => {
    const { i18n } = useTranslation();
    const classes = useStyles();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
      const fetchCategory = async () => {
        try {
          const { data } = await api.get(`/category/${categoryId}`);
              setName(data.name)
              setDescription(data.description)
        } catch (err) {
          toastError(err);
        }
      };
        if(categoryId){
          fetchCategory();
        };
    }, [open, categoryId]);

    const handleClose = () => {
      setName("");
      setDescription("");
      onClose();
    };

    const handleChangeName = (e) => {
        setName(e.target.value);
    };

    const handleChangeDescription = (e) => {
        setDescription(e.target.value);
    };

    const handleSubmit = async () => {
      const categoryData = {
          name: name,
          description: description,
      };
      try {
        if (categoryId) {
          await api.put(`/category/${categoryId}`, categoryData);
          toast.success(i18n.t("category.confirmation.editMsg"));
        } else {
          await api.post(`/category/`, categoryData);
          toast.success(i18n.t("category.confirmation.addMsg"));
        }
        handleClose();
      } catch (err) {
        toastError(err);
      }
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
            {categoryId
              ? `${i18n.t("category.categoryModal.edit")}`
              : `${i18n.t("category.categoryModal.create")}`}
          </DialogTitle>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    label={i18n.t("category.categoryModal.name")}
                    autoFocus
                    value={name}
                    name="name"
                    onChange={(e) => { handleChangeName(e) }}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div>
                  <TextField
                    as={TextField}
                    label={i18n.t("category.categoryModal.description")}
                    type="text"
                    onChange={(e) => { handleChangeDescription(e) }}
                    value={description}
                    multiline
                    minRows={5}
                    fullWidth
                    maxLength="1024"
                    name="description"
                    variant="outlined"
                    margin="dense"
                  />
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                  onClick={handleSubmit}
                >
                   {categoryId
                    ? `${i18n.t("category.buttons.edit")}`
                    : `${i18n.t("category.buttons.add")}`}
                </Button>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  variant="outlined"
                >
                  {i18n.t("category.categoryModal.cancel")}
                </Button>
              </DialogActions>
          </Dialog>
      </div>
    );
};

export default CategoryModal;
