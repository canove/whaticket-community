import React, { forwardRef, useContext, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import { Badge } from "@material-ui/core";
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

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { useTranslation } from "react-i18next";

import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import List from "@material-ui/core/List";
import PropTypes from "prop-types";
import Collapse from "@material-ui/core/Collapse";
import api from "../services/api";
import toastError from "../errors/toastError";

function ListItemLink(props) {
  const { icon, to, primary, className, open, ...other } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  let icons = null;
  if (open != null) {
    icons = open ? <ExpandLess /> : <ExpandMore />;
  }

  return (
    <li>
      <ListItem button component={renderLink} className={className} {...other}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
        {icons}
      </ListItem>
    </li>
  );
}

ListItemLink.propTypes = {
  open: PropTypes.bool,
  to: PropTypes.string.isRequired,
};

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
  } else {
    return null;
  }
}

function ListParentItemLink(props) {
  const { icon, primary, className, id, connected } = props;

  const [open, setOpen] = useState(false);
  const [menus, setMenus] = useState([]);

  const renderedIcon = getIcon(icon);

  const handleClick = () => {
    setOpen((prevOpen) => !prevOpen);
  }

  const fetchChildrenMenu = async () => {
    try {
      const { data } = await api.get(`/menus/children/${id}`);
      setMenus(data);
    } catch (err) {
      toastError(err);
    }
  }

  useEffect(() => {
    fetchChildrenMenu();
  }, []);

  return (
    <List>
      <li>
        <ListItem button open={open} onClick={handleClick} className={className}>
          {renderedIcon ? <ListItemIcon><Badge overlap="rectangular" badgeContent={connected ? "!" : 0} color="error">{renderedIcon}</Badge></ListItemIcon> : null}
          <ListItemText primary={primary} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
      </li>
      <Collapse component="li" in={open} timeout="auto" unmountOnExit>
        <List disablePadding>
          { menus && menus.map((menu) => {
            if (menu.isParent) {
              return (
                <ListParentItemLink
                  key={menu.id}
                  primary={menu.name}
                  icon={menu.icon}
                  id={menu.id}
                />
              )
            } else {
              return (
                <ListItemLinkTest
                  key={menu.id}
                  to={`/${menu.name.replaceAll(' ', '')}`}
                  primary={menu.name}
                  icon={menu.icon}
                />
              )
            }
          })}
        </List>
      </Collapse>
    </List>
  )
}

function ListItemLinkTest(props) {
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
  
  const { i18n } = useTranslation();
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [menus, setMenus] = useState([]);

  const fetchMenus = async () => {
    try {
      const { data } = await api.get('/menus/');
      setMenus(data);
    } catch (err) {
      toastError(err);
    } 
  }

  useEffect(() => {
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
          }return null
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
      { menus && menus.map((menu) => {
        if (menu.name === "Dashboard") {
          return (
            <ListItemLinkTest
              key={menu.id}
              to={'/'}
              primary={menu.name}
              icon={menu.icon}
            />
          )
        }
        if (menu.name === "WhatsApp 2") {
          return (
            <ListParentItemLink
              key={menu.id}
              primary={menu.name}
              icon={menu.icon}
              id={menu.id}
              connected={connectionWarning}
            />
          )
        }
        if (!menu.parentId) {
          if (menu.isParent) {
            return (
              <ListParentItemLink
                key={menu.id}
                primary={menu.name}
                icon={menu.icon}
                id={menu.id}
              />
            )
          } else {
            return (
              <ListItemLinkTest
                key={menu.id}
                to={`/${menu.name.replaceAll(' ', '')}`}
                primary={menu.name}
                icon={menu.icon}
              />
            )
          }
        }
      })}

      {/* <ListItemLink
        to="/"
        primary="Dashboard"
        icon={<DashboardOutlinedIcon />}
      />
      <List>
        <li>
          <ListItem button open={openOff} onClick={handleClickOff}>
            <ListItemIcon>
              <WhatsAppIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t("WhatsApp")} />
            {openOff ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
        </li>
        <Collapse component="li" in={openOff} timeout="auto" unmountOnExit>
          <List disablePadding>
            <ListItemLink
              icon={<SyncAltIcon />}
              primary={i18n.t("mainDrawer.whatsApp.officialConnections")}
              sx={{ pl: 8 }}
              to="/officialConnections"
            />
          </List>
        </Collapse>
      </List>

      <List>
        <li>
          <ListItem button open={open} onClick={handleClick}>
            <ListItemIcon>
              <Badge overlap="rectangular" badgeContent={connectionWarning ? "!" : 0} color="error">
                <WhatsAppIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary={i18n.t("WhatsApp 2")} />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
        </li>
        <Collapse component="li" in={open} timeout="auto" unmountOnExit>
          <List disablePadding>
            <ListItemLink
              icon={<SyncAltIcon />}
              primary={i18n.t("mainDrawer.whatsApp.connections")}
              sx={{ pl: 8 }}
              to="connections"
            />
            <ListItemLink
              icon={<SettingsOutlinedIcon />}
               primary={i18n.t("mainDrawer.whatsApp.settings")}
              sx={{ pl: 8 }}
              to="whatsConfig"
            />
          </List>
        </Collapse>
      </List>
      <ListItemLink
        to="/templates"
        primary={i18n.t("mainDrawer.listItems.template")}
        icon={<DvrIcon />}
      />
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<ChatIcon />}
      />

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneOutlinedIcon />}
      />
      <ListItemLink
        to="/quickAnswers"
        primary={i18n.t("mainDrawer.listItems.quickAnswers")}
        icon={<QuestionAnswerOutlinedIcon />}
      />
      <ListItemLink
        to="/importation"
        primary={i18n.t("mainDrawer.listItems.importation")}
        icon={<ImportExportOutlinedIcon />}
      /> */}
      {/* <Divider /> */}
      {/* <List>
        <li>
          <ListItem button open={openAdm} onClick={handleClickAdm}>
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText
              primary={i18n.t("mainDrawer.listItems.administration")}
            />
            {openAdm ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
        </li>
        <Collapse component="li" in={openAdm} timeout="auto" unmountOnExit>
          <ListItemLink
            to="/users"
            primary={i18n.t("mainDrawer.listItems.users")}
            icon={<PeopleAltOutlinedIcon />}
          />
          <ListItemLink
            to="/company"
            primary={i18n.t("Empresa")}
            icon={<ApartmentIcon />}
          />
          <ListItemLink
            to="/queues"
            primary={i18n.t("mainDrawer.listItems.queues")}
            icon={<AccountTreeOutlinedIcon />}
          />
          <ListItemLink
            to="/settings"
            primary={i18n.t("mainDrawer.listItems.settings")}
            icon={<SettingsOutlinedIcon />}
          />

          <li>
            <ListItem button open={openRel} onClick={handleClickRel}>
              <ListItemIcon>
                <EqualizerIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.reports")} />
              {openRel ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
          </li>
          <Collapse component="li" in={openRel} timeout="auto" unmountOnExit>
            <ListItemLink
              to="/reports"
              primary={i18n.t("mainDrawer.listItems.reportsTalk")}
              icon={<AssessmentOutlinedIcon />}
            />
            <ListItemLink
              to="/reportsTicket"
              primary={i18n.t("mainDrawer.listItems.reportsTicket")}
              icon={<AssessmentOutlinedIcon />}
            />
            <ListItemLink
              to="/registersReports"
              primary={i18n.t("mainDrawer.listItems.logReports")}
              icon={<AssessmentOutlinedIcon />}
            />
          </Collapse>
        </Collapse>
      </List> */}
    </div>
  );
};

export default MainListItems;
