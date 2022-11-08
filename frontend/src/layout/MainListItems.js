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
import ApartmentIcon from '@material-ui/icons/Apartment';
import ListAltIcon from '@material-ui/icons/ListAlt';
import MenuIcon from '@material-ui/icons/Menu';
import BallotIcon from '@material-ui/icons/Ballot';
import ArchiveIcon from '@material-ui/icons/Archive';
import LanguageIcon from '@material-ui/icons/Language';
import CategoryIcon from '@material-ui/icons/Category';
import TimelineIcon from '@material-ui/icons/Timeline';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import PaymentIcon from '@material-ui/icons/Payment';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { useTranslation } from "react-i18next";

import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import List from "@material-ui/core/List";
import Collapse from "@material-ui/core/Collapse";
import api from "../services/api";
import toastError from "../errors/toastError";
import { AuthContext } from "../context/Auth/AuthContext";


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,

  },
  nested: {
    padding: 15,
    width: '100%',
    paddingLeft: theme.spacing(4),
  },
  open: {
    backgroundColor: "lightgray",
  }
}
));

function getIcon(icon, isParent) {
  let color = "";

  if (isParent) {
    color = "black";
  }

  if (icon === "DashboardOutlinedIcon") {
    return <DashboardOutlinedIcon style={{ color }} />;
  }
  else if (icon === "WhatsAppIcon") {
    return <WhatsAppIcon style={{ color }} />;
  }
  else if (icon === "SyncAltIcon") {
    return <SyncAltIcon style={{ color }} />;
  }
  else if (icon === "SettingsOutlinedIcon") {
    return <SettingsOutlinedIcon style={{ color }} />;
  }
  else if (icon === "DvrIcon") {
    return <DvrIcon style={{ color }} />;
  }
  else if (icon === "ChatIcon") {
    return <ChatIcon style={{ color }} />;
  }
  else if (icon === "ContactPhoneOutlinedIcon") {
    return <ContactPhoneOutlinedIcon style={{ color }} />;
  }
  else if (icon === "QuestionAnswerOutlinedIcon") {
    return <QuestionAnswerOutlinedIcon style={{ color }} />;
  }
  else if (icon === "ImportExportOutlinedIcon") {
    return <ImportExportOutlinedIcon style={{ color }} />;
  }
  else if (icon === "AccountCircleIcon") {
    return <AccountCircleIcon style={{ color }} />;
  }
  else if (icon === "PeopleAltOutlinedIcon") {
    return <PeopleAltOutlinedIcon style={{ color }} />;
  }
  else if (icon === "AccountTreeOutlinedIcon") {
    return <AccountTreeOutlinedIcon style={{ color }} />;
  }
  else if (icon === "EqualizerIcon") {
    return <EqualizerIcon style={{ color }} />;
  }
  else if (icon === "AssessmentOutlinedIcon") {
    return <AssessmentOutlinedIcon style={{ color }} />
  }
  else if (icon === "ApartmentIcon") {
    return <ApartmentIcon style={{ color }} />;
  }
  else if (icon === "ListAltIcon") {
    return <ListAltIcon style={{ color }} />
  }
  else if (icon === "MenuIcon") {
    return <MenuIcon style={{ color }} />
  }
  else if (icon === "BallotIcon") {
    return <BallotIcon style={{ color }} />
  }
  else if (icon === "ArchiveIcon") {
    return <ArchiveIcon style={{ color }} />
  }
  else if (icon === "LanguageIcon") {
    return <LanguageIcon style={{ color }} />
  }
  else if (icon === "CategoryIcon") {
    return <CategoryIcon style={{ color }} />
  }
  else if (icon === "TimelineIcon") {
    return <TimelineIcon style={{ color }} />
  }
  else if (icon === "AttachMoneyIcon") {
        return <AttachMoneyIcon style={{ color }} />
  }
  else if (icon === "MonetizationOnIcon") {
        return <MonetizationOnIcon style={{ color }} />
  }
  else if (icon === "PaymentIcon") {
        return <PaymentIcon style={{ color }} />
  }
  else if (icon === "ShoppingCartIcon") {
        return <ShoppingCartIcon style={{ color }} />
  }
  else {
    return null;
  }
}

function ListParentItemLink(props) {
  const { icon, primary, connectionWarning, children, translation, drawerOpen } = props;

  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const renderedIcon = getIcon(icon, true);

  const handleClick = () => {
    setOpen((prevOpen) => !prevOpen);
  }

  //<Badge overlap="rectangular" badgeContent={connectionWarning ? "!" : 0} color="error"></Badge>

  return (
    <List>
      <li>
        <ListItem button open={open} onClick={handleClick} className={classes.root}>
          {renderedIcon ? <ListItemIcon>{renderedIcon}</ListItemIcon> : null}
          <ListItemText primary={primary} />
          {open ? < KeyboardArrowDownIcon fontSize="large" /> : <ArrowForwardIosIcon fontSize="small" />}
        </ListItem>
      </li>
      <Collapse component="li" in={open} timeout="auto" unmountOnExit>
        <List disablePadding className={drawerOpen ? classes.nested : ""} >
          { children && children.map(child => {
            if (child.isParent) {
              return (
                <ListParentItemLink
                  key={child.id}
                  icon={child.icon}
                  primary={translation(child.name)}
                  children={child.children}
                  translation={translation}
                  drawerOpen={drawerOpen}
                />
              )
            } else {
              return (
                <ListItemLink
                  key={child.id}
                  to={`/${(child.name).replaceAll(" ", "")}`}
                  primary={translation(child.name)}
                  icon={child.icon}
                  drawerOpen={drawerOpen}
                />
              )
            }
          }) }
        </List>
      </Collapse>
    </List>
  )
}

function ListItemLink(props) {
  const { icon, to, primary, className, drawerOpen, ...other } = props;

  const renderLink = forwardRef((itemProps, ref) => (<RouterLink to={to} ref={ref} {...itemProps} />))

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
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const { i18n } = useTranslation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    const getParentMenu = async (menuId) => {
      try {
        const { data } = await api.get(`/menus/${menuId}`);
        return data;
      } catch (err) {
        toastError(err);
      }
    }

    const fetchMenus = async () => {
      try {
        const { data } = await api.get(`/menus/company`);

        const menus = [];
        const allMenus = [];
        const parentMenus = [];
        const parentMenusIds = [];

        for (const menu of data) {
          if (menu.parentId) {
            if (parentMenusIds.indexOf(menu.parentId) === -1) {
              parentMenusIds.push(menu.parentId);

              const parentMenu = await getParentMenu(menu.parentId);
              parentMenus.push(parentMenu);
              allMenus.push(parentMenu);
              allMenus.push(menu);
            } else {
              allMenus.push(menu);
            }
          } else {
            allMenus.push(menu);
          }
        }

        for (const parent of parentMenus) {
          if (parent.parentId && parentMenusIds.indexOf(parent.parentId) === -1) {
            parentMenusIds.push(parent.parentId);

            const parentMenu = await getParentMenu(parent.parentId);
            allMenus.push(parentMenu);
          }
        }

        for (const menu of allMenus) {
          if (menu.parentId || menu.isParent) {
            if (menu.isParent) {
              const childrenMenus = [];
              for (const children of allMenus) {
                if (children.parentId === menu.id) {
                  childrenMenus.push(children);
                }
              }
              menu.children = [...childrenMenus];
              if (!menu.parentId) {
                menus.push(menu);
              }
            }
          } else {
            menus.push(menu);
          }
        }
        setMenus(menus);
      } catch (err) {
        toastError(err);
      }
    }

    fetchMenus();
  }, [user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          if (whats.official === false) {
            return (
              whats.status === "qrcode" ||
              whats.status === "PAIRING" ||
              whats.status === "DISCONNECTED" ||
              whats.status === "TIMEOUT" ||
              whats.status === "OPENING"
            );
          } return null
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  function getTranslation(name) {
    if (name === "Dashboard") {
      return i18n.t("mainDrawer.listItems.dashboard");
    }

    if (name === "WhatsApp") {
      return i18n.t("mainDrawer.listItems.whatsOff");
    }

    if (name === "Official Connections") {
      return i18n.t("mainDrawer.whatsApp.officialConnections");
    }

    if (name === "Templates") {
      return i18n.t("mainDrawer.listItems.template");
    }

    if (name === "WhatsApp 2") {
      return i18n.t("mainDrawer.listItems.whatsNoOff");
    }

    if (name === "Connections") {
      return i18n.t("mainDrawer.whatsApp.connections");
    }

    if (name === "Whats Config") {
      return i18n.t("mainDrawer.whatsApp.settings");
    }

    if (name === "Template Data") {
      return i18n.t("mainDrawer.listItems.template");
    }

    if (name === "Tickets") {
      return i18n.t("mainDrawer.listItems.tickets");
    }

    if (name === "Contacts") {
      return i18n.t("mainDrawer.listItems.contacts");
    }

    if (name === "Quick Answers") {
      return i18n.t("mainDrawer.listItems.quickAnswers");
    }

    if (name === "Importation") {
      return i18n.t("mainDrawer.listItems.importation");
    }

    if (name === "File Import") {
      return i18n.t("mainDrawer.listItems.fileImport");
    }

    if (name === "Integrated Import") {
      return i18n.t("mainDrawer.listItems.integratedImport");
    }

    if (name === "Administration") {
      return i18n.t("mainDrawer.listItems.administration");
    }

    if (name === "Users") {
      return i18n.t("mainDrawer.listItems.users");
    }

    if (name === "Company") {
      return i18n.t("mainDrawer.listItems.company");
    }

    if (name === "Menus") {
      return i18n.t("mainDrawer.listItems.menus");
    }

    if (name === "Queues") {
      return i18n.t("mainDrawer.listItems.queues");
    }

    if (name === "Category") {
      return i18n.t("mainDrawer.listItems.category");
    }

    if (name === "Settings") {
      return i18n.t("mainDrawer.listItems.settings");
    }

    if (name === "Reports") {
      return i18n.t("mainDrawer.listItems.reports");
    }

    if (name === "Reports Talk") {
      return i18n.t("mainDrawer.listItems.reportsTalk");
    }

    if (name === "Reports Ticket") {
      return i18n.t("mainDrawer.listItems.reportsTicket");
    }

    if (name === "Registers Reports") {
      return i18n.t("mainDrawer.listItems.logReports");
    }
    if (name === "Admin BITS") {
      return i18n.t("mainDrawer.listItems.adminBits");
    }
    if (name === "Menu Link") {
      return i18n.t("mainDrawer.listItems.menuLink");
    }
    if (name === "Registration") {
      return i18n.t("mainDrawer.listItems.registration");
    }
    if (name === "Finance") {
      return i18n.t("mainDrawer.listItems.finance");
    }
    if (name === "Products") {
      return i18n.t("mainDrawer.listItems.products");
    }
    if (name === "Pricing") {
      return i18n.t("mainDrawer.listItems.pricing");
    }
    if (name === "Payments") {
      return i18n.t("mainDrawer.listItems.payments");
    }
    if (name === "Flows") {
      return i18n.t("mainDrawer.listItems.flows");
    }
    if (name === "Connection Files") {
      return i18n.t("mainDrawer.listItems.connectionFiles");
    }
    if (name === "Exposed Imports") {
      return i18n.t("exposedImports.title");
    }
    if (name === "Chips Reports") {
      return i18n.t("chipReports.title");
    }

    return name;
  }

  return (
    <div onClick={drawerClose}>
      { menus && menus.map(menu => {
        if (menu.name === "Dashboard") {
          return (
            <ListItemLink
              key={menu.id}
              to={`/`}
              primary={getTranslation(menu.name)}
              icon={menu.icon}
              drawerOpen={drawerOpen}
            />
          )
        }

        if (menu.isParent) {
          return (
            <ListParentItemLink
              key={menu.id}
              icon={menu.icon}
              primary={getTranslation(menu.name)}
              children={menu.children}
              translation={getTranslation}
              drawerOpen={drawerOpen}
            />
          )
        } else {
          return (
            <ListItemLink
              key={menu.id}
              to={`/${(menu.name).replaceAll(" ", "")}`}
              primary={getTranslation(menu.name)}
              icon={menu.icon}
              drawerOpen={drawerOpen}
            />
          )
        }
      })}
    </div>
  );
};

export default MainListItems;
