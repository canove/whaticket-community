import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SettingsIcon from "@material-ui/icons/Settings";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import CompanyRegistration from "../../components/CompanyRegistration";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import CompanyFirebase from "../../components/CompanyFirebase";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_COMPANIES") {
    const companies = action.payload;
    const newCompanies = [];

    companies.forEach((company) => {
      const companyIndex = state.findIndex((u) => u.id === company.id);
      if (companyIndex !== -1) {
        state[companyIndex] = company;
      } else {
        newCompanies.push(company);
      }
    });

    return [...state, ...newCompanies];
  }

  if (action.type === "UPDATE_COMPANIES") {
    const company = action.payload;
    const companyIndex = state.findIndex((u) => u.id === company.id);

    if (companyIndex !== -1) {
      state[companyIndex] = company;
      return [...state];
    } else {
      return [company, ...state];
    }
  }

  if (action.type === "DELETE_COMPANY") {
    const companyId = action.payload;

    const companyIndex = state.findIndex((u) => u.id === companyId);
    if (companyIndex !== -1) {
      state.splice(companyIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const Company= () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [deletingCompany, setDeletingcompany] = useState(null);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [companyFirebaseModalOpen, setCompanyFirebaseModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [companies, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchCompanies = async () => {
        try {
          const { data } = await api.get("/company/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_COMPANIES", payload: data.companies });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
          setLoading(false);
        }
      };
      fetchCompanies();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = openSocket();

    socket.on(`company${user.companyId}`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_COMPANIES", payload: data.company });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_COMPANY", payload: + data.companyId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenCompanyModal = () => {
    setSelectedCompany(null);
    setCompanyModalOpen(true);
  };

  const handleCloseCompanyModal = () => {
    setSelectedCompany(null);
    setCompanyModalOpen(false);
  };

  const handleOpenCompanyFirebaseModal = (company) => {
    setSelectedCompany(company);
    setCompanyFirebaseModalOpen(true);
  };

  const handleCloseCompanyFirebaseModal = () => {
    setSelectedCompany(null);
    setCompanyFirebaseModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setCompanyModalOpen(true);
  };

  const handleDeleteCompany= async (companyId) => {
    try {
      await api.delete(`/companies/${companyId}`);
      toast.success(i18n.t("company.toast"));
    } catch (err) {
      toastError(err);
    }
    setDeletingcompany(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingCompany &&
          `${i18n.t("company.deleteCompany")} ${
            deletingCompany.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteCompany(deletingCompany.id)}
      >
      </ConfirmationModal>
      <CompanyRegistration
        open={companyModalOpen}
        onClose={handleCloseCompanyModal}
        aria-labelledby="form-dialog-title"
        companyId={selectedCompany && selectedCompany.id}
      />
      <CompanyFirebase
        open={companyFirebaseModalOpen}
        onClose={handleCloseCompanyFirebaseModal}
        companyId={selectedCompany && selectedCompany.id}
      />
      <MainHeader>
        <Title>{i18n.t("company.title")}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
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
            onClick={handleOpenCompanyModal}
          >
            {i18n.t("company.buttons.addCompany")}
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
              <TableCell align="center">{i18n.t("company.grid.companyId")}</TableCell>
              <TableCell align="center">{i18n.t("Alias")}</TableCell>
              <TableCell align="center">{i18n.t("company.grid.name")}</TableCell>
              <TableCell align="center">{i18n.t("company.grid.cnpj")}</TableCell>
              <TableCell align="center">{i18n.t("company.grid.phone")}</TableCell>
              <TableCell align="center">{i18n.t("company.grid.email")}</TableCell>
              <TableCell align="center">{i18n.t("company.grid.address")}</TableCell>
              <TableCell align="center">{i18n.t("company.grid.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell align="center">{company.id}</TableCell>
                  <TableCell align="center">{company.alias}</TableCell>
                  <TableCell align="center">{company.name}</TableCell>
                  <TableCell align="center">{company.cnpj}</TableCell>
                  <TableCell align="center">{company.phone}</TableCell>
                  <TableCell align="center">{company.email}</TableCell>
                  <TableCell align="center">{company.address}</TableCell>
                  <TableCell align="center">
                    <div style={{display:"inline-block", minWidth:"90px"}}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenCompanyFirebaseModal(company)}
                      >
                        <SettingsIcon />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleEditCompany(company)}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setConfirmModalOpen(true);
                          setDeletingcompany(company);
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={8} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Company;
