import React, { forwardRef, useContext, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Badge, makeStyles } from "@material-ui/core";
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
import MenuIcon from "@material-ui/icons/Menu";
import BallotIcon from "@material-ui/icons/Ballot";
import ArchiveIcon from "@material-ui/icons/Archive";
import LanguageIcon from "@material-ui/icons/Language";
import CategoryIcon from "@material-ui/icons/Category";
import TimelineIcon from "@material-ui/icons/Timeline";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import MonetizationOnIcon from "@material-ui/icons/MonetizationOn";
import PaymentIcon from "@material-ui/icons/Payment";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { useTranslation } from "react-i18next";

import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import List from "@material-ui/core/List";
import Collapse from "@material-ui/core/Collapse";
import api from "../services/api";
import toastError from "../errors/toastError";
import { AuthContext } from "../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
  },
  nested: {
    padding: 15,
    width: "100%",
    paddingLeft: theme.spacing(4),
  },
  open: {
    backgroundColor: "lightgray",
  },
}));

const menuTranslation = {
  "Dashboard": "mainDrawer.listItems.dashboard",
  "WhatsApp": "mainDrawer.listItems.whatsOff",
  "Official Connections": "mainDrawer.whatsApp.officialConnections",
  "Templates": "mainDrawer.listItems.template",
  "WhatsApp 2": "mainDrawer.listItems.whatsNoOff",
  "Connections": "mainDrawer.whatsApp.connections",
  "Whats Config": "mainDrawer.whatsApp.settings",
  "Template Data": "mainDrawer.listItems.template",
  "Tickets": "mainDrawer.listItems.tickets",
  "Contacts": "mainDrawer.listItems.contacts",
  "Quick Answers": "mainDrawer.listItems.quickAnswers",
  "Importation": "mainDrawer.listItems.importation",
  "File Import": "mainDrawer.listItems.fileImport",
  "Integrated Import": "mainDrawer.listItems.integratedImport",
  "Administration": "mainDrawer.listItems.administration",
  "Users": "mainDrawer.listItems.users",
  "Company": "mainDrawer.listItems.company",
  "Menus": "mainDrawer.listItems.menus",
  "Queues": "mainDrawer.listItems.queues",
  "Category": "mainDrawer.listItems.category",
  "Settings": "mainDrawer.listItems.settings",
  "Reports": "mainDrawer.listItems.reports",
  "Conversation Reports": "mainDrawer.listItems.conversationReports",
  "Reports Talk": "mainDrawer.listItems.reportsTalk",
  "General Report": "Relatório Geral",
  "Reports Ticket": "mainDrawer.listItems.reportsTicket",
  "Registers Reports": "mainDrawer.listItems.logReports",
  "Admin BITS": "mainDrawer.listItems.adminBits",
  "Menu Link": "mainDrawer.listItems.menuLink",
  "Registration": "mainDrawer.listItems.registration",
  "Finance": "mainDrawer.listItems.finance",
  "Products": "mainDrawer.listItems.products",
  "Pricing": "mainDrawer.listItems.pricing",
  "Payments": "mainDrawer.listItems.payments",
  "Flows": "mainDrawer.listItems.flows",
  "Connection Files": "mainDrawer.listItems.connectionFiles",
  "Exposed Imports": "exposedImports.title",
  "Chips Reports": "chipReports.title",
  "Node Reports": "nodeReports.title",
  "Whats Contacts": "officialPages.officialContacts.title",
  "Official Whatsapp Report": "sessionReports.title",
  "Category Report": "mainDrawer.listItems.categoryReport",
  "Service Time": "Tempo de Atendimento",
  "Contact Blacklist": "Blacklist de Contatos",
  "Supervisor": "Supervisor",
  "Satisfaction Survey": "Pesquisa de Satisfação",
  "Packages": "Pacotes",
  "Batch": "batch.title",
}

function getIcon(icon, isParent) {
  let color = "";

  if (isParent) {
    color = "black";
  }

  if (icon === "DashboardOutlinedIcon") {
    return <DashboardOutlinedIcon style={{ color }} />;
  } else if (icon === "WhatsAppIcon") {
    return <WhatsAppIcon style={{ color }} />;
  } else if (icon === "SyncAltIcon") {
    return <SyncAltIcon style={{ color }} />;
  } else if (icon === "SettingsOutlinedIcon") {
    return <SettingsOutlinedIcon style={{ color }} />;
  } else if (icon === "DvrIcon") {
    return <DvrIcon style={{ color }} />;
  } else if (icon === "ChatIcon") {
    return <ChatIcon style={{ color }} />;
  } else if (icon === "ContactPhoneOutlinedIcon") {
    return <ContactPhoneOutlinedIcon style={{ color }} />;
  } else if (icon === "QuestionAnswerOutlinedIcon") {
    return <QuestionAnswerOutlinedIcon style={{ color }} />;
  } else if (icon === "ImportExportOutlinedIcon") {
    return <ImportExportOutlinedIcon style={{ color }} />;
  } else if (icon === "AccountCircleIcon") {
    return <AccountCircleIcon style={{ color }} />;
  } else if (icon === "PeopleAltOutlinedIcon") {
    return <PeopleAltOutlinedIcon style={{ color }} />;
  } else if (icon === "AccountTreeOutlinedIcon") {
    return <AccountTreeOutlinedIcon style={{ color }} />;
  } else if (icon === "EqualizerIcon") {
    return <EqualizerIcon style={{ color }} />;
  } else if (icon === "AssessmentOutlinedIcon") {
    return <AssessmentOutlinedIcon style={{ color }} />;
  } else if (icon === "ApartmentIcon") {
    return <ApartmentIcon style={{ color }} />;
  } else if (icon === "ListAltIcon") {
    return <ListAltIcon style={{ color }} />;
  } else if (icon === "MenuIcon") {
    return <MenuIcon style={{ color }} />;
  } else if (icon === "BallotIcon") {
    return <BallotIcon style={{ color }} />;
  } else if (icon === "ArchiveIcon") {
    return <ArchiveIcon style={{ color }} />;
  } else if (icon === "LanguageIcon") {
    return <LanguageIcon style={{ color }} />;
  } else if (icon === "CategoryIcon") {
    return <CategoryIcon style={{ color }} />;
  } else if (icon === "TimelineIcon") {
    return <TimelineIcon style={{ color }} />;
  } else if (icon === "AttachMoneyIcon") {
    return <AttachMoneyIcon style={{ color }} />;
  } else if (icon === "MonetizationOnIcon") {
    return <MonetizationOnIcon style={{ color }} />;
  } else if (icon === "PaymentIcon") {
    return <PaymentIcon style={{ color }} />;
  } else if (icon === "ShoppingCartIcon") {
    return <ShoppingCartIcon style={{ color }} />;
  } else {
    return null;
  }
}

function ListParentItemLink(props) {
  const {
    icon,
    primary,
    connectionWarning,
    childrenMenus,
    translation,
    drawerOpen,
  } = props;

  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const renderedIcon = getIcon(icon, true);

  const handleClick = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  //<Badge overlap="rectangular" badgeContent={connectionWarning ? "!" : 0} color="error"></Badge>

  return (
    <List>
      <li>
        <ListItem
          button
          open={open}
          onClick={handleClick}
          className={classes.root}
        >
          {renderedIcon ? <ListItemIcon>{renderedIcon}</ListItemIcon> : null}
          <ListItemText primary={primary} />
          {open ? (
            <KeyboardArrowDownIcon fontSize="large" />
          ) : (
            <ArrowForwardIosIcon fontSize="small" />
          )}
        </ListItem>
      </li>
      <Collapse component="li" in={open} timeout="auto" unmountOnExit>
        <List disablePadding className={drawerOpen ? classes.nested : ""}>
          {childrenMenus &&
            childrenMenus.map((child) => {
              if (child.isParent) {
                return (
                  <ListParentItemLink
                    key={child.id}
                    icon={child.icon}
                    primary={translation(child.name)}
                    childrenMenus={child.childrenMenus}
                    translation={translation}
                    drawerOpen={drawerOpen}
                  />
                );
              } else {
                return (
                  <ListItemLink
                    key={child.id}
                    to={`/${child.name.replaceAll(" ", "")}`}
                    primary={translation(child.name)}
                    icon={child.icon}
                    drawerOpen={drawerOpen}
                  />
                );
              }
            })}
        </List>
      </Collapse>
    </List>
  );
}

function ListItemLink(props) {
  const { icon, to, primary, className, drawerOpen, ...other } = props;

  const renderLink = forwardRef((itemProps, ref) => (
    <RouterLink to={to} ref={ref} {...itemProps} />
  ));

  const renderedIcon = getIcon(icon, false);

  return (
    <li>
      <ListItem button component={renderLink} className={className} {...other}>
        {renderedIcon ? <ListItemIcon>{renderedIcon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const MainListItems = (props) => {
  const { drawerOpen, drawerClose } = props;
  // const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const { i18n } = useTranslation();

  // const [connectionWarning, setConnectionWarning] = useState(false);
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    const fetchMenus = async () => {
      if (!user.name) return;

      try {
        const { data } = await api.get("/menus/layout");
        setMenus(data);
      } catch (err) {
        toastError(err);
      }
    };

    fetchMenus();
  }, [user]);

  // useEffect(() => {
  //   const delayDebounceFn = setTimeout(() => {
  //     if (whatsApps.length > 0) {
  //       const offlineWhats = whatsApps.filter((whats) => {
  //         if (whats.official === false) {
  //           return (
  //             whats.status === "qrcode" ||
  //             whats.status === "PAIRING" ||
  //             whats.status === "DISCONNECTED" ||
  //             whats.status === "TIMEOUT" ||
  //             whats.status === "OPENING"
  //           );
  //         }
  //         return null;
  //       });
  //       if (offlineWhats.length > 0) {
  //         setConnectionWarning(true);
  //       } else {
  //         setConnectionWarning(false);
  //       }
  //     }
  //   }, 2000);
  //   return () => clearTimeout(delayDebounceFn);
  // }, [whatsApps]);

  const getTranslation = (name) => {
    const translationLink = menuTranslation[name];

    if (translationLink) {
      return i18n.t(translationLink);
    }

    return name;
  }

  return (
    <div onClick={drawerClose}>
      {menus &&
        menus.map((menu) => {
          if (menu.name === "Dashboard") {
            return (
              <ListItemLink
                key={menu.id}
                to={`/`}
                primary={getTranslation(menu.name)}
                icon={menu.icon}
                drawerOpen={drawerOpen}
              />
            );
          }

          if (menu.isParent) {
            return (
              <ListParentItemLink
                key={menu.id}
                icon={menu.icon}
                primary={getTranslation(menu.name)}
                childrenMenus={menu.childrenMenus}
                translation={getTranslation}
                drawerOpen={drawerOpen}
              />
            );
          } else {
            return (
              <ListItemLink
                key={menu.id}
                to={`/${menu.name.replaceAll(" ", "")}`}
                primary={getTranslation(menu.name)}
                icon={menu.icon}
                drawerOpen={drawerOpen}
              />
            );
          }
        })}
    </div>
  );
};

export default MainListItems;
