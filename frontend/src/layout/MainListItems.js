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
    paddingLeft: theme.spacing(4),
  },
}
));

function getIcon(icon) {
  if (icon === "DashboardOutlinedIcon") {
    return <DashboardOutlinedIcon />;
  } else if (icon === "WhatsAppIcon") {
    return <WhatsAppIcon />;
  } else if (icon === "SyncAltIcon") {
    return <SyncAltIcon />;
  } else if (icon === "SettingsOutlinedIcon") {
    return <SettingsOutlinedIcon />;
  } else if (icon === "DvrIcon") {
    return <DvrIcon />;
  } else if (icon === "ChatIcon") {
    return <ChatIcon />;
  } else if (icon === "ContactPhoneOutlinedIcon") {
    return <ContactPhoneOutlinedIcon />;
  } else if (icon === "QuestionAnswerOutlinedIcon") {
    return <QuestionAnswerOutlinedIcon />;
  } else if (icon === "ImportExportOutlinedIcon") {
    return <ImportExportOutlinedIcon />;
  } else if (icon === "AccountCircleIcon") {
    return <AccountCircleIcon />;
  } else if (icon === "PeopleAltOutlinedIcon") {
    return <PeopleAltOutlinedIcon />;
  } else if (icon === "AccountTreeOutlinedIcon") {
    return <AccountTreeOutlinedIcon />;
  } else if (icon === "EqualizerIcon") {
    return <EqualizerIcon />;
  } else if (icon === "AssessmentOutlinedIcon") {
    return <AssessmentOutlinedIcon />
  } else if (icon === "ApartmentIcon") {
    return <ApartmentIcon />;
  } else if (icon === "ListAltIcon") {
    return <ListAltIcon />
  } else if (icon === "MenuIcon") {
    return <MenuIcon />
  } else if (icon === "BallotIcon") {
    return <BallotIcon />
  } else {
    return null;
  }
}

function ListParentItemLink(props) {
  const { icon, primary, className, connectionWarning, children } = props;
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const renderedIcon = getIcon(icon);

  const handleClick = () => {
    setOpen((prevOpen) => !prevOpen);
  }

  // <Badge overlap="rectangular" badgeContent={connectionWarning ? "!" : 0} color="error"></Badge>

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
        <List disablePadding className={classes.nested} >
          { children && children.map(child => {
            if (child.isParent) {
              return (
                <ListParentItemLink
                  key={child.id}
                  icon={child.icon}
                  primary={child.name}
                  children={child.children}
                />
              )
            } else {
              return (
                <ListItemLink
                  key={child.id}
                  to={`/${(child.name).replaceAll(" ", "")}`}
                  primary={child.name}
                  icon={child.icon}
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
  const { icon, to, primary, className, ...other } = props;

  const renderLink = forwardRef((itemProps, ref) => (<RouterLink to={to} ref={ref} {...itemProps} />))

  const renderedIcon = getIcon(icon);

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
  const { drawerClose } = props;
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
        const parentMenusIds = [];

        for (const menu of data) {
          if (menu.parentId) {
            if (parentMenusIds.indexOf(menu.parentId) === -1) {
              parentMenusIds.push(menu.parentId);

              const parentMenu = await getParentMenu(menu.parentId);
              allMenus.push(parentMenu);
              allMenus.push(menu);
            } else {
              allMenus.push(menu);
            }
          } else {
            allMenus.push(menu);
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
        console.log(err);
        toastError(err);
      }
    }

    fetchMenus();
  }, []);

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

  return (
    <div onClick={drawerClose}>
      { menus && menus.map(menu => {
        if (menu.name === "Dashboard") {
          return (
            <ListItemLink
              key={menu.id}
              to={`/`}
              primary={menu.name}
              icon={menu.icon}
            />
          )
        }

        if (menu.isParent) {
          return (
            <ListParentItemLink
              key={menu.id}
              icon={menu.icon}
              primary={menu.name}
              children={menu.children}
            />
          )
        } else {
          return (
            <ListItemLink
              key={menu.id}
              to={`/${(menu.name).replaceAll(" ", "")}`}
              primary={menu.name}
              icon={menu.icon}
            />
          )
        }
      })}
    </div>
  );
};

export default MainListItems;
