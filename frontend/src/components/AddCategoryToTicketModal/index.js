import React, { useEffect, useState } from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";

import toastError from "../../errors/toastError";
import api from "../../services/api";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import ButtonWithSpinner from "../ButtonWithSpinner";
import CategorySelect from "../CategorySelect";

const AddCategoryToTicketModal = ({ modalOpen, onClose, ticket }) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedCategoryIds(ticket.categories.map((category) => category.id));
  }, [ticket]);

  const handleClose = () => {
    console.log(ticket);
    onClose();
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    console.log("setSelectedCategoryIds", selectedCategoryIds);
    // if (!ticketid) return;
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        categoriesIds: selectedCategoryIds,
      });
      setLoading(false);
      handleClose();
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <form onSubmit={handleSaveTicket}>
        <DialogTitle id="form-dialog-title">Categorias del ticket</DialogTitle>
        <DialogContent dividers style={{ width: "600px" }}>
          <CategorySelect
            selectedCategoryIds={selectedCategoryIds}
            onChange={(values) => setSelectedCategoryIds(values)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            disabled={loading}
            variant="outlined"
          >
            Cancelar
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="submit"
            color="primary"
            loading={loading}
          >
            Guardar
          </ButtonWithSpinner>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddCategoryToTicketModal;
