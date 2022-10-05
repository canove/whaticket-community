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
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import CategoryModal from "../../components/CategoryModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";

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
  if (action.type === "LOAD_CATEGORY") {
    const categories = action.payload;
    const newCategory = [];

    categories.forEach((category) => {
      const categoryIndex = state.findIndex((q) => q.id === category.id);
      if (categoryIndex !== -1) {
        state[categoryIndex] = category;
      } else {
        newCategory.push(category);
      }
    });

    return [...state, ...newCategory];
  }

  if (action.type === "UPDATE_CATEGORY") {
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

const Category = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [categories, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const {user} = useContext(AuthContext)

     useEffect(() => {
        dispatch({ type: "RESET" });
    }, []);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const { data } = await api.get("/category/");
                dispatch({ type: "LOAD_CATEGORY", payload: data });
                setLoading(false);
            } catch (err) {
                toastError(err);
            }
        };
        fetchCategory();
    }, []);

    useEffect(() => {
      const socket = openSocket();

      socket.on(`category${user.companyId}`, (data) => {
        if (data.action === "update" || data.action === "create") {
          dispatch({ type: "UPDATE_CATEGORY", payload: data.category });
        }

        if (data.action === "delete") {
          dispatch({ type: "DELETE_CATEGORY", payload: + data.categoryId });
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
        toast.success(i18n.t("category.confirmation.delete"));
    } catch (err) {
        toastError(err);
    }
    setDeletingCategory(null);
  };

  return (
    <MainContainer>
      <CategoryModal
        open={categoryModalOpen}
        onClose={handleCloseCategoryModal}
        aria-labelledby="form-dialog-title"
        categoryId={selectedCategory && selectedCategory.id}
      />
      <ConfirmationModal
        title={
          deletingCategory &&
          `${i18n.t("category.confirmation.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteCategory(deletingCategory.id)}
      >
        {i18n.t("category.confirmation.deleteMsg")}
      </ConfirmationModal>
      <MainHeader>
        <Title>{i18n.t("category.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCategoryModal}
          >
            {i18n.t("category.buttons.create")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("category.grid.name")}</TableCell>
              <TableCell align="center">{i18n.t("category.grid.description")}</TableCell>
              <TableCell align="center">{i18n.t("category.grid.createdAt")}</TableCell>
              <TableCell align="center">{i18n.t("category.grid.action")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {categories && categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell align="center">{category.name}</TableCell>
                  <TableCell align="center">{category.description}</TableCell>
                  <TableCell align="center">{format(parseISO(category.createdAt), "dd/MM/yy HH:mm")}</TableCell>
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
                        setDeletingCategory(category);
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

export default Category;
