import React, { useState, useContext, useCallback, useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import openSocket from "../../services/socket-io";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { 
    Button, 
    Checkbox, 
    Chip, 
    FormControl, 
    Grid, 
    Input, 
    InputLabel, 
    ListItemIcon, 
    ListSubheader, 
    MenuItem, 
    Select, 
    Slider, 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow, 
    TextField, 
    Typography
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import GreetingMessageModal from "../../components/GreetingMessageModal";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ConfirmationModal from "../../components/ConfirmationModal";
import Autocomplete from "@material-ui/lab/Autocomplete";

import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import { grey } from '@material-ui/core/colors';

import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import QuestionAnswerOutlinedIcon from "@material-ui/icons/QuestionAnswerOutlined";
import AssessmentOutlinedIcon from "@material-ui/icons/AssessmentOutlined";
import ImportExportOutlinedIcon from "@material-ui/icons/ImportExportOutlined";
import DvrIcon from "@material-ui/icons/Dvr";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import ChatIcon from "@material-ui/icons/Chat";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ApartmentIcon from '@material-ui/icons/Apartment';
import ListAltIcon from '@material-ui/icons/ListAlt';

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(8, 8, 3),
	},
	paper: {
        flex: 1,
		padding: theme.spacing(2),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
	},
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
    },
    chips: {
		display: "flex",
		flexWrap: "wrap",
	},
	chip: {
		margin: 2,
	},
    formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
}));

function getStyles(id, menuId, theme) {
    return {
        fontWeight:
            menuId.indexOf(id) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

function getIconStyles(id, menuId) {
    return {
        color: 
            menuId.indexOf(id) === -1
                ? grey[500]
                : grey[900],
    }
}

function getIcon(icon, id, selectedMenusIds) {
    if (icon === "DashboardOutlinedIcon") {
        return <DashboardOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "WhatsAppIcon") {
        return <WhatsAppIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "SyncAltIcon") {
        return <SyncAltIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "SettingsOutlinedIcon") {
        return <SettingsOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "DvrIcon") {
        return <DvrIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "ChatIcon") {
        return <ChatIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "ContactPhoneOutlinedIcon") {
        return <ContactPhoneOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "QuestionAnswerOutlinedIcon") {
        return <QuestionAnswerOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "ImportExportOutlinedIcon") {
        return <ImportExportOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "AccountCircleIcon") {
        return <AccountCircleIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "PeopleAltOutlinedIcon") {
        return <PeopleAltOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "AccountTreeOutlinedIcon") {
        return <AccountTreeOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "EqualizerIcon") {
        return <EqualizerIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "AssessmentOutlinedIcon") {
        return <AssessmentOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />
    } else if (icon === "ApartmentIcon") {
        return <ApartmentIcon style={getIconStyles(id, selectedMenusIds)} />;
    } else if (icon === "ListAltIcon") {
        return <ListAltIcon style={getIconStyles(id, selectedMenusIds)} />
    } else {
        return null;
    }
}

const Menus = () => {
	const classes = useStyles();
    const theme = useTheme();
	const { i18n } = useTranslation();

    const [companies, setCompanies] = useState([]);
    const [menus, setMenus] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedMenusIds, setSelectedMenusIds] = useState([]);
    const [saving, setSaving] = useState(false);

    const fetchCompanies = async () => {
        try {
            const { data } = await api.get('/company');
            setCompanies(data.companies);
        } catch (err) {
            toastError(err);
        }
    }

    const fetchMenus = async () => {
        try {
            const { data } = await api.get('/menus');
            setMenus(data);
        } catch (err) {
            toastError(err);
        }
    }

    useEffect(() => {
        fetchCompanies();
        fetchMenus();
    }, []);

    const handleSelectCompanyChange = (e, company) => {
        if (company) {
            setSelectedCompany(company);
            setSelectedMenusIds([]);
            if (company.menus.length > 0) {
                setSelectedMenusIds(company.menus.map(menu => (menu.id)));
            }
        } else {
            setSelectedCompany(null);
            setSelectedMenusIds([]);
        }
    }

    const handleSelectMenusChange = (e) => {
        setSelectedMenusIds(e.target.value);
    }

    const saveChanges = async () => {
        setSaving(true);

        const companyBody = {...selectedCompany, menusIds: selectedMenusIds}

        try {
            await api.put(`/companies/${selectedCompany.id}`, companyBody);
            setSaving(false);
        } catch (err) {
            toastError(err);
            setSaving(false);
        }

    }

	return (
	    <MainContainer>
            <MainHeader>
                <Title>Menus</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        color="primary"
                        variant="contained"
                        disabled={!selectedCompany || saving}
                        onClick={saveChanges}
                    >
                        Salvar
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
            >
                <Paper
                    className={classes.paper}
                    variant="outlined"
                >
                    <Autocomplete
                        onChange={(e, newValue) => { handleSelectCompanyChange(e, newValue) }}
                        disablePortal
                        id="combo-box-companies"
                        options={companies}
                        getOptionLabel={(option) => option.name}
                        style={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label="Companies" variant="outlined" />}
                    />
                </Paper>
                <Paper
                    className={classes.paper}
                    variant="outlined"
                >
                    <FormControl fullWidth margin="dense" variant="outlined">
                        <InputLabel>{i18n.t("queueSelect.inputLabel")}</InputLabel>
                        <Select
                            disabled={!selectedCompany}
                            multiple
                            labelWidth={60}
                            value={selectedMenusIds}
                            onChange={(e) => { handleSelectMenusChange(e) }}
                            MenuProps={{
                                anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left",
                                },
                                transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left",
                                },
                                getContentAnchorEl: null,
                            }}
                            renderValue={selected => (
                                <div className={classes.chips}>
                                    {selected?.length > 0 &&
                                        selected.map(id => {
                                            const menu = menus.find(m => m.id === id);
                                            return menu ? (
                                                <Chip
                                                    key={id}
                                                    variant="outlined"
                                                    label={menu.name}
                                                    className={classes.chip}
                                                />
                                            ) : null;
                                        })}
                                </div>
                            )}
                        >
                            {menus.map(menu => {
                                if (!menu.isParent) {
                                    return (
                                        <MenuItem key={menu.id} value={menu.id} style={getStyles(menu.id, selectedMenusIds, theme)}>
                                            <ListItemIcon>{getIcon(menu.icon, menu.id, selectedMenusIds)}</ListItemIcon>
                                            {menu.name}
                                        </MenuItem>
                                    )
                                }
                            })}
                        </Select>
			        </FormControl>
                </Paper>
            </Paper>
        </MainContainer>
	);
};

export default Menus;
