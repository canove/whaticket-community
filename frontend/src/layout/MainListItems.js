import React, { useContext, useEffect, useState } from "react";
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

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { useTranslation } from "react-i18next";

import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import List from "@material-ui/core/List";
import PropTypes from "prop-types";
import Collapse from "@material-ui/core/Collapse";

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

const MainListItems = (props) => {
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const { i18n } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [openOff, setOpenOff] = React.useState(false);
  const [openRel, setOpenRel] = React.useState(false);
  const [openAdm, setOpenAdm] = React.useState(false);

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

  const handleClickOff = () => {
    setOpenOff((prevOpen) => !prevOpen);
  };

  const handleClick = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClickRel = () => {
    setOpenRel((prevOpen) => !prevOpen);
  };

  const handleClickAdm = () => {
    setOpenAdm((prevOpen) => !prevOpen);
  };

  return (
    <div onClick={drawerClose}>
      <ListItemLink
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
              <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
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
      />
      <Divider />
      <List>
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
      </List>
    </div>
  );
};

export default MainListItems;
