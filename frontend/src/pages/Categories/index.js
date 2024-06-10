import React, { useEffect, useReducer, useState } from "react";

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
} from "@material-ui/core";

import { DeleteOutline, Edit } from "@material-ui/icons";
import { toast } from "react-toastify";
import CategoryModal from "../../components/CategoryModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

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
  if (action.type === "LOAD_CATEGORIES") {
    const categories = action.payload;
    const newCategories = [];

    categories.forEach((category) => {
      const categoryIndex = state.findIndex((q) => q.id === category.id);
      if (categoryIndex !== -1) {
        state[categoryIndex] = category;
      } else {
        newCategories.push(category);
      }
    });

    return [...state, ...newCategories];
  }

  if (action.type === "UPDATE_CATEGORIES") {
    const category = action.payload;
    const categoryIndex = state.findIndex((u) => u.id === category.id);

    if (categoryIndex !== -1) {
      state[categoryIndex] = category;
      return [...state];
    } else {
      return [category, ...state];
    }
  }

  if (action.type === "DELETE_CATEGORY") {
    const categoryId = action.payload;
    const categoryIndex = state.findIndex((q) => q.id === categoryId);
    if (categoryIndex !== -1) {
      state.splice(categoryIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Categories = () => {
  const classes = useStyles();

  const [categories, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/categories");
        dispatch({ type: "LOAD_CATEGORIES", payload: data });

        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const socket = openSocket();

    socket.on("category", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CATEGORIES", payload: data.category });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CATEGORY", payload: data.categoryId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenCategoryModal = () => {
    setCategoryModalOpen(true);
    setSelectedCategory(null);
  };

  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
    setSelectedCategory(null);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await api.delete(`/category/${categoryId}`);
      toast.success(i18n.t("Category deleted successfully!"));
    } catch (err) {
      toastError(err);
    }
    setSelectedCategory(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selectedCategory &&
          `${i18n.t("categories.confirmationModal.deleteTitle")} ${
            selectedCategory.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteCategory(selectedCategory.id)}
      >
        {i18n.t("categories.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <CategoryModal
        open={categoryModalOpen}
        onClose={handleCloseCategoryModal}
        categoryId={selectedCategory?.id}
      />
      <MainHeader>
        <Title>{i18n.t("categories.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCategoryModal}
          >
            {i18n.t("categories.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("categories.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("categories.table.color")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("categories.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell align="center">{category.name}</TableCell>
                  <TableCell align="center">
                    <div className={classes.customTableCell}>
                      <span
                        style={{
                          backgroundColor: category.color,
                          width: 60,
                          height: 20,
                          alignSelf: "center",
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedCategory(category);
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

export default Categories;
