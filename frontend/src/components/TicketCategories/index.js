import React, { useEffect, useState } from "react";

import Chip from "@material-ui/core/Chip";
import LabelIcon from "@material-ui/icons/Label";
import Autocomplete from "@material-ui/lab/Autocomplete";
import toastError from "../../errors/toastError";
import api from "../../services/api";

import TextField from "@material-ui/core/TextField";

const TicketCategories = ({ ticket }) => {
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [autocompleteValue, setAutocompleteValue] = useState([]);

  const autocompleteLoading =
    autocompleteOpen && autocompleteOptions?.length === 0;

  useEffect(() => {
    if (ticket && ticket.categories) {
      console.log(
        "_____ TicketCategories ticket categories",
        ticket.categories
      );
      setAutocompleteValue([
        ...ticket.categories?.map((category) => {
          return {
            id: category.id,
            name: category.name,
            color: category.color,
          };
        }),
      ]);
    }
  }, [ticket]);

  useEffect(() => {
    let active = true;

    if (!autocompleteLoading) {
      return undefined;
    }

    (async () => {
      if (autocompleteOpen) {
        const { data } = await api.get("/categories");
        console.log("categories", data);
        if (active) {
          setAutocompleteOptions([...data]);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [autocompleteLoading]);

  useEffect(() => {
    if (!autocompleteOpen) {
      setAutocompleteOptions([]);
    }
  }, [autocompleteOpen]);

  return (
    <Autocomplete
      multiple={true}
      value={autocompleteValue}
      getOptionLabel={(option) => option.name}
      renderOption={(option) => {
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <LabelIcon style={{ color: option.color }} /> {option.name}
          </div>
        );
      }}
      options={autocompleteOptions}
      loadingText="Cargando..."
      isOptionEqualToValue={(a, b) => a.id === b.id}
      onChange={async (e, newCategories) => {
        try {
          await api.put(`/tickets/${ticket.id}`, {
            categoriesIds: newCategories.map((category) => category.id),
          });
        } catch (err) {
          console.log(err);
          toastError(err);
        }
      }}
      open={autocompleteOpen}
      onOpen={() => setAutocompleteOpen(true)}
      onClose={() => setAutocompleteOpen(false)}
      openOnFocus={true}
      size="small"
      loading={autocompleteLoading}
      freeSolo
      autoHighlight
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            variant="outlined"
            label={option.name}
            size="small"
            style={{ backgroundColor: option.color }}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          size="small"
          placeholder={
            autocompleteValue?.length > 0 ? "" : "Agregar Categorias"
          }
        />
      )}
    />
  );
};
export default TicketCategories;
