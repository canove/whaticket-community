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
    const [description, setDescription] = useState("");
    const [openSelect, setOpenSelect] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState("Nenhuma");

    useEffect(() => {
      const fetchCategory = async () => {
        try {
          const { data } = await api.get(`/category`);
            setDescription(data)
        } catch (err) {
            toastError(err);
        }
    };
          fetchCategory();
    }, [open]);

    const handleUpdateTicketStatus = async (e, status, userId, categoryId) => {
		try {
			await api.put(`/tickets/${ticketId}`, {
				status: status,
				userId: userId || null,
                categoryId: categoryId === "Nenhuma" ? null : categoryId
			});
			if (status === "open") {
				history.push(`/tickets/${ticketId}`);
			} else {
				history.push("/tickets");
			}
		} catch (err) {
			toastError(err);
		  }
	  };

    const handleClose = () => {
      onClose();
    };

    const handleSelectDescription = (e) => {
      setSelectedDescription(e.target.value);
    };

    const handleOpenSelect = () => {
		  setOpenSelect(true)
	  };

    const handleCloseSelect = () => {
      setOpenSelect(false)
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
            {i18n.t("category.title")}
          </DialogTitle>
              <DialogContent dividers>
                <Typography variant="subtitle1" gutterBottom>
                    {i18n.t("category.categoryModal.select")}
                </Typography>
					<div className={classes.multFieldLine}>
						<Select
							variant="outlined"
							labelId="type-select-label"
							id="type-select"
							value={selectedDescription}
							label="Type"
							onChange={(e) => { handleSelectDescription(e) }}
							open={openSelect}
							onOpen={handleOpenSelect}
							onClose={handleCloseSelect}
							style={{width: "100%"}}
						>
              <MenuItem value={"Nenhuma"}>{i18n.t("category.categoryModal.none")}</MenuItem>
							{description.length > 0 && description.map((category, index) => {
										return (
							<MenuItem key={index} value={category.id}>{category.name}</MenuItem>
										)
							})}
						</Select>
					</div>
              </DialogContent>
              <DialogActions>
                <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    className={classes.btnWrapper}
                    onClick={e => handleUpdateTicketStatus(e, "closed", userId, selectedDescription)}
                >
                {i18n.t("Resolver")}
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

export default ResolveModal;
