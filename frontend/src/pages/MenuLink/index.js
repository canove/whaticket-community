import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import {
  Button,
  Chip,
  FormControl,
  InputLabel,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Autocomplete from "@material-ui/lab/Autocomplete";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { grey } from "@material-ui/core/colors";
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
import ApartmentIcon from "@material-ui/icons/Apartment";
import ListAltIcon from "@material-ui/icons/ListAlt";
import { toast } from "react-toastify";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import BallotIcon from '@material-ui/icons/Ballot';
import MenuIcon from '@material-ui/icons/Menu';
import ArchiveIcon from '@material-ui/icons/Archive';
import LanguageIcon from '@material-ui/icons/Language';
import CategoryIcon from '@material-ui/icons/Category';
import TimelineIcon from '@material-ui/icons/Timeline';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import PaymentIcon from '@material-ui/icons/Payment';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

const useStyles = makeStyles((theme) => ({
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
  menu: {
    margin: 2,
    fontFamily: ' Arial',
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
    color: menuId.indexOf(id) === -1 ? grey[500] : grey[900],
  };
}

function getIcon(icon, id, selectedMenusIds) {
  if (icon === "DashboardOutlinedIcon") {
    return (<DashboardOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />);
  }
  else if (icon === "WhatsAppIcon") {
    return <WhatsAppIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "SyncAltIcon") {
    return <SyncAltIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "SettingsOutlinedIcon") {
    return <SettingsOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "DvrIcon") {
    return <DvrIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "ChatIcon") {
    return <ChatIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "ContactPhoneOutlinedIcon") {
    return (<ContactPhoneOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />);
  }
  else if (icon === "QuestionAnswerOutlinedIcon") {
    return (<QuestionAnswerOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />);
  }
  else if (icon === "ImportExportOutlinedIcon") {
    return (<ImportExportOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />);
  }
  else if (icon === "AccountCircleIcon") {
    return <AccountCircleIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "PeopleAltOutlinedIcon") {
    return (<PeopleAltOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />);
  }
  else if (icon === "AccountTreeOutlinedIcon") {
    return (<AccountTreeOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />);
  }
  else if (icon === "EqualizerIcon") {
    return <EqualizerIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "AssessmentOutlinedIcon") {
    return (<AssessmentOutlinedIcon style={getIconStyles(id, selectedMenusIds)} />);
  }
  else if (icon === "ApartmentIcon") {
    return <ApartmentIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "ListAltIcon") {
    return <ListAltIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "MenuIcon") {
    return <MenuIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "BallotIcon") {
    return <BallotIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "ArchiveIcon") {
    return <ArchiveIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "LanguageIcon") {
    return <LanguageIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "CategoryIcon") {
    return <CategoryIcon style={getIconStyles(id, selectedMenusIds)} />;
  }
  else if (icon === "TimelineIcon") {
    return <TimelineIcon style={getIconStyles(id, selectedMenusIds)} />
  }
  else if (icon === "AttachMoneyIcon") {
    return <AttachMoneyIcon style={getIconStyles(id, selectedMenusIds)} />
  }
  else if (icon === "MonetizationOnIcon") {
    return <MonetizationOnIcon style={getIconStyles(id, selectedMenusIds)} />
  }
  else if (icon === "PaymentIcon") {
    return <PaymentIcon style={getIconStyles(id, selectedMenusIds)} />
  }
  else if (icon === "ShoppingCartIcon") {
    return <ShoppingCartIcon style={getIconStyles(id, selectedMenusIds)} />
  }
  else {
    return null;
  }
}


const MenuLink = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { i18n } = useTranslation();

  const [companies, setCompanies] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedMenusIds, setSelectedMenusIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [openArray, setOpenArray] = useState([])

  const fetchCompanies = async () => {
    try {
      const { data } = await api.get("/company");
      setCompanies(data.companies);
    } catch (err) {
      toastError(err);
    }
  };

  const getMenuName = (menuName) => {
    if(menuName === "Dashboard"){
      return i18n.t("Dashboard")
    }
    if(menuName === "Official Connections"){
      return i18n.t("Conexões Oficiais")
    }
    if(menuName === "Templates"){
      return i18n.t("Templates")
    }
    if(menuName === "Connections"){
      return i18n.t("Conexões")
    }
    if(menuName === "Templates Data"){
      return i18n.t("Templates Data")
    }
    if(menuName === "Whats Config"){
      return i18n.t("Configurações")
    }
    if(menuName === "Tickets"){
      return i18n.t("Chamadas")
    }
    if(menuName === "Contacts"){
      return i18n.t("Contatos")
    }
    if(menuName === "Quick Answers"){
      return i18n.t("Respostas Rápidas")
    }
    if(menuName === "Importation"){
      return i18n.t("Importação")
    }
    if(menuName === "Administration"){
      return i18n.t("Administração")
    }
    if(menuName === "Users"){
      return i18n.t("Usuário")
    }
    if(menuName === "Company"){
      return i18n.t("Empresa")
    }
    if(menuName === "Menus"){
      return i18n.t("Menus")
    }
    if(menuName === "Menu Link"){
      return i18n.t("Vínculo de Menus")
    }
    if(menuName === "Registration"){
      return i18n.t("Cadastro")
    }
    if(menuName === "Queues"){
      return i18n.t("Filas")
    }
    if(menuName === "Setting"){
      return i18n.t("Configurações")
    }
    if(menuName === "Reports"){
      return i18n.t("Relatórios Conversa")
    }
    if(menuName === "Talk Reports"){
      return i18n.t("Relatórios Conversa")
    }
    if(menuName === "Reports Ticket"){
      return i18n.t("Relatórios Chamadas")
    }
    if(menuName === "Registers Reports"){
      return i18n.t("Relatório Registro")
    }
    if(menuName === "Fle Import"){
      return i18n.t("Importação Arquivo")
    }
    if(menuName === "Integrated Import"){
      return i18n.t("Importação Integrada")
    }
    if(menuName === "Category"){
      return i18n.t("Categoria")
    }
    if(menuName === "Admin BITS"){
      return i18n.t("Admin BITS")
    }
    if(menuName === "Finance"){
      return i18n.t("Finanças")
    }
    if(menuName === "Products"){
      return i18n.t("Produtos")
    }
    if(menuName === "Pricing"){
      return i18n.t("Precificação")
    }
    if(menuName === "Payments"){
      return i18n.t("Pagamento")
    }
    if(menuName === "Flows"){
      return i18n.t("Fluxo")
    }

    return menuName
  };

  const fetchMenus = async () => {
    try {
      const { data } = await api.get("/menus");
      const menus = [];
      let childrenMenus = [];

      data.menus.forEach((menu) => {
        if (menu.parentId || menu.isParent) {
          if (menu.isParent) {
            data.menus.forEach((menu2) => {
              if (menu2.parentId === menu.id && !menu2.isParent) {
                childrenMenus.push(menu2);
              }
            })
            menu.children = [...childrenMenus];
            menus.push(menu);
            childrenMenus = [];
          }
        } else {
          menus.push(menu);
        }
      })
      setMenus(menus);
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchMenus();
  }, []);

  const handleSelectCompanyChange = (e, company) => {
    if (company) {
      setSelectedCompany(company);
      setSelectedMenusIds([]);
      if (company.menus.length > 0) {
        setSelectedMenusIds(company.menus.map((menu) => menu.id));
      }
    } else {
      setSelectedCompany(null);
      setSelectedMenusIds([]);
    }
  };

  const handleSelectMenusChange = (e) => {
    const array = e.target.value;
    if (array.indexOf(undefined) !== -1) {
      const undefinedIndex = array.indexOf(undefined);
      array.splice(undefinedIndex, 1);
    }

    setSelectedMenusIds(array);
  };

  const saveChanges = async () => {
    setSaving(true);
    const companyBody = { ...selectedCompany, menusIds: selectedMenusIds };
    try {
      await api.put(`/companies/${selectedCompany.id}`, companyBody);
      setSaving(false);
      toast.success(i18n.t("menu.success"));
    } catch (err) {
      toastError(err);
      setSaving(false);
    }
  };

  const handleOpen = (menuId) => {
    if (openArray.indexOf(menuId) === -1) {
      setOpenArray(prevArray => [...prevArray, menuId])
    } else {
      const menuIndex = openArray.indexOf(menuId);
      const array = [...openArray];
      array.splice(menuIndex, 1);

      setOpenArray(array)
    }
  };

  const getMenus = () => {
    const renderedMenus = [];

    menus.forEach((menu) => {
      if (menu.isParent) {
        const renderedParentMenu =
        <ListSubheader disableGutters key={menu.id} id={menu.id}>
            <Button onClick={() => {handleOpen(menu.id)}}>
                  <ListItemIcon>
                    {getIcon(menu.icon, menu.id, selectedMenusIds)}
                  </ListItemIcon>
                <ListItemText style={{textAlign:'left'}} primary={getMenuName(menu.name)} className={classes.menu}/>
                { openArray.indexOf(menu.id) !== -1 ? < KeyboardArrowDownIcon fontSize="large" /> : <ArrowForwardIosIcon fontSize="small" />}
            </Button>
        </ListSubheader>
        renderedMenus.push(renderedParentMenu);

        menu.children.map((children) => {
          const renderedMenuItem = openArray.indexOf(menu.id) !== -1 &&
          <MenuItem key={children.id} value={children.id} style={getStyles(children.id, selectedMenusIds, theme)}>
            <ListItemIcon>
              { getIcon(children.icon, children.id, selectedMenusIds) }
            </ListItemIcon>{ getMenuName(children.name) }
          </MenuItem>
          renderedMenus.push(renderedMenuItem);return null
        })
      } else {
        const renderedMenuItem =
        <MenuItem key={menu.id} value={menu.id} style={getStyles(menu.id, selectedMenusIds, theme)}>
          <ListItemIcon>
            { getIcon(menu.icon, menu.id, selectedMenusIds) }
          </ListItemIcon>{ getMenuName(menu.name) }
        </MenuItem>
        renderedMenus.push(renderedMenuItem);
      }
    });

    return renderedMenus;
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("menu.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            color="primary"
            variant="contained"
            disabled={!selectedCompany || saving}
            onClick={saveChanges}
          >
            {i18n.t("menu.buttons.save")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Paper className={classes.paper} variant="outlined">
          <Autocomplete
            onChange={(e, newValue) => {
              handleSelectCompanyChange(e, newValue);
            }}
            disablePortal
            id="combo-box-companies"
            options={companies}
            getOptionLabel={(option) => option.name}
            style={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={i18n.t("menu.buttons.company")}
                variant="outlined"
              />
            )}
          />
        </Paper>
        <Paper className={classes.paper} variant="outlined">
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel> {i18n.t("menu.buttons.menus")}</InputLabel>
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
              renderValue={(selected) => (
                <div className={classes.chips}>
                  {selected?.length > 0 &&
                    selected.map((id) => {
                      let menu;

                      menus.forEach((m) => {
                        if (m.id === id) {
                          menu = m;
                        }
                        if (m.isParent) {
                          m.children.forEach((c) => {
                            if (c.id === id) {
                              menu = c;
                            }
                          })
                        }
                      });

                      return menu ? (
                        <Chip
                          key={id}
                          variant="outlined"
                          label={getMenuName(menu.name)}
                          className={classes.chip}
                        />
                      ) : null;
                    })}
                </div>
              )}
            >
              { getMenus().map(menuItem => menuItem) }

            </Select>
          </FormControl>
        </Paper>
      </Paper>
    </MainContainer>
  );
};

export default MenuLink;
