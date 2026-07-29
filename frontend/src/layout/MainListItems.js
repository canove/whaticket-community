import React, { useContext, useEffect, useState, useMemo } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import clsx from "clsx";

import { makeStyles, fade } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import { Badge } from "@material-ui/core";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import QuestionAnswerOutlinedIcon from "@material-ui/icons/QuestionAnswerOutlined";
import SendOutlinedIcon from "@material-ui/icons/SendOutlined";
import BarChartOutlinedIcon from "@material-ui/icons/BarChartOutlined";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import AndroidOutlinedIcon from "@material-ui/icons/AndroidOutlined";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";

const useStyles = makeStyles((theme) => ({
  listItem: {
    borderRadius: 10,
    margin: "2px 8px",
    width: "auto",
    padding: "6px 10px",
    color: theme.palette.text.secondary,
    "&:hover": { backgroundColor: theme.palette.action.hover },
  },
  active: {
    backgroundColor: fade(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
    "&:hover": { backgroundColor: fade(theme.palette.primary.main, 0.16) },
    "& $icon": { color: theme.palette.primary.main },
    "& .MuiListItemText-primary": { fontWeight: 600 },
  },
  icon: {
    minWidth: 32,
    color: "inherit",
    "& svg": {
      fontSize: 19,
    },
  },
  text: {
    margin: 0,
    "& .MuiListItemText-primary": {
      fontSize: "0.82rem",
      fontWeight: 500,
    },
  },
  comingSoon: {
    opacity: 0.55,
    cursor: "default",
    "&:hover": { backgroundColor: "transparent" },
  },
  soonBadge: {
    fontSize: "0.6rem",
    fontWeight: 700,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.action.hover,
    padding: "1px 6px",
    borderRadius: 999,
    marginLeft: "auto",
  },
  subheader: {
    fontSize: "0.68rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: theme.palette.text.secondary,
    lineHeight: "34px",
    paddingLeft: 18,
  },
}));

function ListItemLink({ icon, primary, to, collapsed }) {
  const classes = useStyles();
  const location = useLocation();
  const selected =
    to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(to);

  const renderLink = useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem
        button
        component={renderLink}
        className={clsx(classes.listItem, { [classes.active]: selected })}
      >
        {icon ? <ListItemIcon className={classes.icon}>{icon}</ListItemIcon> : null}
        {!collapsed && (
          <ListItemText className={classes.text} primary={primary} />
        )}
      </ListItem>
    </li>
  );
}

function ComingSoonItem({ icon, primary, collapsed }) {
  const classes = useStyles();
  return (
    <li>
      <ListItem className={clsx(classes.listItem, classes.comingSoon)}>
        {icon ? <ListItemIcon className={classes.icon}>{icon}</ListItemIcon> : null}
        {!collapsed && (
          <ListItemText className={classes.text} primary={primary} />
        )}
      </ListItem>
    </li>
  );
}

const MainListItems = (props) => {
  const classes = useStyles();
  const { drawerClose, drawerOpen } = props;
  const collapsed = drawerOpen === false;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        setConnectionWarning(offlineWhats.length > 0);
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  return (
    <div onClick={drawerClose}>
      <ListItemLink
        to="/"
        primary="Dashboard"
        collapsed={collapsed}
        icon={<DashboardOutlinedIcon />}
      />
      <ListItemLink
        to="/connections"
        primary={i18n.t("mainDrawer.listItems.connections")}
        collapsed={collapsed}
        icon={
          <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
            <SyncAltIcon />
          </Badge>
        }
      />
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        collapsed={collapsed}
        icon={<WhatsAppIcon />}
      />
      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        collapsed={collapsed}
        icon={<ContactPhoneOutlinedIcon />}
      />
      <ListItemLink
        to="/quickAnswers"
        primary={i18n.t("mainDrawer.listItems.quickAnswers")}
        collapsed={collapsed}
        icon={<QuestionAnswerOutlinedIcon />}
      />

      {!collapsed && (
        <ListSubheader className={classes.subheader} disableSticky>
          Em breve
        </ListSubheader>
      )}
      <ComingSoonItem primary="Campanhas" collapsed={collapsed} icon={<SendOutlinedIcon />} />
      <ComingSoonItem primary="Relatórios" collapsed={collapsed} icon={<BarChartOutlinedIcon />} />
      <ComingSoonItem primary="Templates" collapsed={collapsed} icon={<DescriptionOutlinedIcon />} />
      <ComingSoonItem primary="Agentes" collapsed={collapsed} icon={<AndroidOutlinedIcon />} />

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider />
            {!collapsed && (
              <ListSubheader className={classes.subheader} disableSticky>
                {i18n.t("mainDrawer.listItems.administration")}
              </ListSubheader>
            )}
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              collapsed={collapsed}
              icon={<PeopleAltOutlinedIcon />}
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              collapsed={collapsed}
              icon={<AccountTreeOutlinedIcon />}
            />
            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              collapsed={collapsed}
              icon={<SettingsOutlinedIcon />}
            />
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;
