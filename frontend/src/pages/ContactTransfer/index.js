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
import Checkbox from "@material-ui/core/Checkbox";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import ImportExportOutlinedIcon from "@material-ui/icons/ImportExportOutlined";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/Auth/AuthContext";
import { FormControl, InputLabel, MenuItem, Select, TableSortLabel, Typography } from "@material-ui/core";
import TransferContactModal from "../../components/TransferContactModal";
import Autocomplete from "@material-ui/lab/Autocomplete";
import MultipleWhatsConfigModal from "../../components/MultipleWhatsConfigModal";
import useWhatsApps2 from "../../hooks/useWhatsApps2";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const ContactTransfer = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [contactTransferModalOpen, setContactTransferModalOpen] = useState(false);
  const [selectedWhatsapps, setSelectedWhatsapps] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [isBusiness, setIsBusiness] = useState(false);

  const [allSelected, setAllSelected] = useState(false);
  const [editWhatsModalOpen, setEditWhatsModalOpen] = useState(false);

  const { user } = useContext(AuthContext);

  const { whatsapps, count, hasMore, loading } = useWhatsApps2({
		official: false,
		pageNumber,
		name: searchParam,
		selectedCompanyId: company,
    business: isBusiness,
    status: "CONNECTED",
	});

  useEffect(() => {
    setPageNumber(1);
  }, [company, searchParam, isBusiness]);

	useEffect(() => {
		for (const whats of whatsapps) {
      if (selectedWhatsapps.indexOf(whats.id) === -1) {
        setAllSelected(false);
        break;
      }
    }
	}, [whatsapps]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
          const { data } = await api.get("/company");
          setCompanies(data.companies);
      } catch (err) {
          toastError(err);
      }
    }

    fetchCompanies();
  }, []);

  const handleOpenContactTransferModal = (whats) => {
    if (whats && whats.id) {
      setSelectedWhatsapps([whats.id]);
    }

    setContactTransferModalOpen(true);
  };

  const handleCloseContactTransferModal = () => {
    setContactTransferModalOpen(false);
  };

  const handleCompanySelectOption = (_, newValue) => {
    if (newValue === null) {
      setCompany("");
    } else {
      setCompany(newValue.id);
    }
  }

  const renderOptionLabel = (option) => {
    if (option.name) return option.name;

    return ""
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelectedsPage = whatsapps.map((whats) => whats.id);

      const newSelecteds = [];

      for (const selectedWhats of selectedWhatsapps) {
        if (newSelecteds.indexOf(selectedWhats) === -1) {
          newSelecteds.push(selectedWhats);
        }
      }

      for (const selectedWhats of newSelectedsPage) {
        if (newSelecteds.indexOf(selectedWhats) === -1) {
          newSelecteds.push(selectedWhats);
        }
      }

      setSelectedWhatsapps(newSelecteds);
      setAllSelected(true);
      return;
    }

    setAllSelected(false);
    setSelectedWhatsapps([]);
  }

  const isSelected = (id) => {
    return selectedWhatsapps.indexOf(id) !== -1;
  }

  const handleRowClick = (e, whats) => {
    const selectedIndex = selectedWhatsapps.indexOf(whats.id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedWhatsapps, whats.id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedWhatsapps.slice(1));
    } else if (selectedIndex === selectedWhatsapps.length - 1) {
      newSelected = newSelected.concat(selectedWhatsapps.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedWhatsapps.slice(0, selectedIndex),
        selectedWhatsapps.slice(selectedIndex + 1),
      );
    }

    setSelectedWhatsapps(newSelected);
  }

  const handleIsBusinessChange = (e) => {
    setIsBusiness(e.target.value);
  }

  const getTranslation = (string) => {
    if (string === true) {
      return "Sim";
    }

    if (string === false) {
      return "Não";
    }

    return string;
  }

  const handleOpenEditWhatsModal = () => {
		setEditWhatsModalOpen(true);
	}

	const handleCloseEditWhatsModal = () => {
		setEditWhatsModalOpen(false);
	}

  return (
    <MainContainer>
      <TransferContactModal
        open={contactTransferModalOpen}
        onClose={handleCloseContactTransferModal}
        selectedWhatsapps={selectedWhatsapps}
      />
      <MultipleWhatsConfigModal
        open={editWhatsModalOpen}
        onClose={handleCloseEditWhatsModal}
        selectedWhatsapps={selectedWhatsapps}
      />
      <MainHeader>
        <Title>Contact Transfer</Title>
        <MainHeaderButtonsWrapper>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "end"
            }}
          >
            <TextField
              style={{
                width: "200px",
              }}
              placeholder="Pesquisar Número"
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
            <Autocomplete
              style={{
                margin: "0 10px",
                width: "200px",
              }}
              options={companies}
              getOptionLabel={renderOptionLabel}
              onChange={(e, newValue) => handleCompanySelectOption(e, newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Empresas"
                  InputLabelProps={{ required: true }}
                />
              )}
            />
            <FormControl
							style={{
								margin: "0 10px 0 0",
							}}
						>
							<InputLabel id="status-select-label">
								Business
							</InputLabel>
							<Select
								labelId="status-select-label"
								id="status-select"
								value={isBusiness}
								label="Status"
								onChange={handleIsBusinessChange}
								style={{width: "150px"}}
							>
								<MenuItem value={""}>Nenhum</MenuItem>
								<MenuItem value={"true"}>Sim</MenuItem>
								<MenuItem value={"false"}>Não</MenuItem>
							</Select>
						</FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenContactTransferModal}
            >
              Transferir Selecionados
            </Button>
            <Button
              style={{ marginLeft: "5px" }}
              variant="contained"
              color="primary"
              onClick={handleOpenEditWhatsModal}
            >
              Editar Perfil Selecionados
            </Button>
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
      >
        <Table size="small">
          <TableHead>
            <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                onChange={handleSelectAll}
                checked={allSelected}
                inputProps={{ 'aria-label': 'select all' }}
              />
            </TableCell>
              <TableCell align="center">Perfil</TableCell>
              <TableCell align="center">Números</TableCell>
              <TableCell align="center">Empresa</TableCell>
              <TableCell align="center">Business</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {whatsapps && whatsapps.map((whats) => {
                const isItemSelected = isSelected(whats.id);
                
                return (
                  <TableRow
                    key={whats.id}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        onClick={(e) => handleRowClick(e, whats)}  
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': whats.name }}
                      />
                    </TableCell>
                    <TableCell align="center">
											<div
												style={{
													display: "flex",
													justifyContent: "center",
													alignItems: "center",
												}}
											>
												{whats.whatsImage && 
												<img
													style={{
														border: "1px solid rgba(0,0,0,0.5)",
														borderRadius: "100%",
														heigth: "30px",
														marginRight: "5px",
														width: "30px",
													}}
													src={whats.whatsImage}
												/>
											}
												{whats.whatsName}
											</div>
										</TableCell>
                    <TableCell align="center">{whats.name}</TableCell>
                    <TableCell align="center">{whats.company.name}</TableCell>
                    <TableCell align="center">{getTranslation(whats.business)}</TableCell>
                    <TableCell align="center">
                      <div style={{display:"inline-block", minWidth:"90px"}}>
                        <IconButton
                          size="small"
                          onClick={() => { handleOpenContactTransferModal(whats) }}
                        >
                          <ImportExportOutlinedIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {loading && <TableRowSkeleton columns={6} />}
            </>
          </TableBody>
        </Table>
        <div
					style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}
				>
					<Button
						variant="outlined"
						onClick={() => { setPageNumber(prevPageNumber => prevPageNumber - 1) }}
						disabled={ pageNumber === 1}
					>
						{i18n.t("importation.buttons.previousPage")}
					</Button>
					<Typography
						style={{ display: "inline-block", fontSize: "1.25rem" }}
					>
						{ pageNumber } / { Math.ceil(count / 10) }
					</Typography>
					<Button
						variant="outlined"
						onClick={() => { setPageNumber(prevPageNumber => prevPageNumber + 1) }}
						disabled={ !hasMore }
					>
						{i18n.t("importation.buttons.nextPage")}
					</Button>
				</div>
      </Paper>
    </MainContainer>
  );
};

export default ContactTransfer;
