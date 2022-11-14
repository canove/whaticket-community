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

const reducer = (state, action) => {
	if (action.type === "LOAD_WHATSAPPS") {
		const whatsApps = action.payload;
		return [...whatsApps];
	}

	if (action.type === "UPDATE_WHATSAPPS") {
		const whatsApp = action.payload;
		const whatsAppIndex = state.findIndex(s => s.id === whatsApp.id);
		if (whatsAppIndex !== -1 || whatsApp.official === true) {
			state[whatsAppIndex] = whatsApp;
			return [...state];
		} else {
			return [whatsApp, ...state];
		}
	}

	if (action.type === "UPDATE_SESSION") {
		const whatsApp = action.payload;
		const whatsAppIndex = state.findIndex(s => s.id === whatsApp.id);

		if (whatsAppIndex !== -1) {
			state[whatsAppIndex].status = whatsApp.status;
			state[whatsAppIndex].updatedAt = whatsApp.updatedAt;
			state[whatsAppIndex].qrcode = whatsApp.qrcode;
			state[whatsAppIndex].retries = whatsApp.retries;
			return [...state];
		} else {
			return [...state];
		}
	}

	// if (action.type === "DELETE_WHATSAPPS") {
	// 	const whatsAppId = action.payload;

	// 	const whatsAppIndex = state.findIndex(s => s.id === whatsAppId);
	// 	if (whatsAppIndex !== -1) {
	// 		state.splice(whatsAppIndex, 1);
	// 	}
	// 	return [...state];
	// }

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

const ContactTransfer = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [contactTransferModalOpen, setContactTransferModalOpen] = useState(false);
  const [selectedWhatsapps, setSelectedWhatsapps] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [isBusiness, setIsBusiness] = useState(false);

  const [allSelected, setAllSelected] = useState(false);
  const [editWhatsModalOpen, setEditWhatsModalOpen] = useState(false);

  const [whatsapps, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);

  useEffect(() => {
		dispatch({ type: "RESET" });
	}, [searchParam, company, pageNumber, isBusiness]);

  useEffect(() => {
    setPageNumber(1);
  }, [company, searchParam, isBusiness]);

	useEffect(() => {
		const fetchWhats = async () => {
      setLoading(true);
			try {
				const { data } = await api.get(`/whatsapp/listAll/`, {
          params: { searchParam, company, pageNumber, isBusiness }
        });
				dispatch({ type: "LOAD_WHATSAPPS", payload: data.whatsapps });
        setHasMore(data.hasMore);
        setCount(data.count);
				setLoading(false);

        for (const whats of data.whatsapps) {
          if (selectedWhatsapps.indexOf(whats.id) === -1) {
            setAllSelected(false);
            break;
          }
        }
			} catch (err) {
        toastError(err);
				setLoading(false);
			}
		};

		fetchWhats();
	}, [pageNumber, searchParam, company, isBusiness, editWhatsModalOpen]);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
          const { data } = await api.get("/company");
          setCompanies(data.companies);
          setLoading(false);
      } catch (err) {
          toastError(err);
          setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  useEffect(() => {
		const socket = openSocket();

		socket.on(`whatsapp${user.companyId}`, data => {
			if (data.action === "update") {
				dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
			}
		});

		// socket.on(`whatsapp${user.companyId}`, data => {
		// 	if (data.action === "delete") {
		// 		dispatch({ type: "DELETE_WHATSAPPS", payload: data.whatsappId });
		// 	}
		// });

		socket.on(`whatsappSession${user.companyId}`, data => {
			if (data.action === "update") {
				dispatch({ type: "UPDATE_SESSION", payload: data.session });
			}
		});

		return () => {
			socket.disconnect();
		};
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
    return option.name;
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
              {whatsapps.map((whats) => {
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
              {loading && <TableRowSkeleton columns={3} />}
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
