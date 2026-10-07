import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import QuestionAnswerOutlinedIcon from "@material-ui/icons/QuestionAnswerOutlined";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";

const useStyles = makeStyles((theme) => ({
  navItem: {
    position: "relative",
    gap: theme.spacing(1.5),
    margin: theme.spacing(0.25, 0),
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.borderRadius.small,
    color: theme.palette.text.primary,
  },
  navItemCollapsed: {
    justifyContent: "center",
    padding: theme.spacing(1, 1.25),
  },
  navItemActive: {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.tintedBackground,
    "&::before": {
      content: '""',
      position: "absolute",
      top: 6,
      bottom: 6,
      left: 0,
      width: 3,
      borderRadius: theme.borderRadius.pill,
      backgroundColor: theme.palette.primary.main,
    },
    "& $navIcon": {
      color: theme.palette.primary.main,
    },
    "& $navText": {
      fontWeight: 500,
    },
  },
  navIcon: {
    minWidth: 0,
    color: theme.palette.text.secondary,
  },
  navTextRoot: {
    flex: "0 1 auto",
  },
  navText: {},
  connectionDot: {
    width: 8,
    height: 8,
    flexShrink: 0,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.palette.error.main,
    boxShadow: theme.border.ring,
  },
  connectionDotCollapsed: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  divider: {
    margin: theme.spacing(0.75, 1),
  },
  sectionLabel: {
    ...theme.typography.sectionLabel,
    padding: theme.spacing(1, 1.5),
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, collapsed, adornment } = props;
  const classes = useStyles();

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <NavLink
          to={to}
          exact={to === "/"}
          activeClassName={classes.navItemActive}
          ref={ref}
          {...itemProps}
        />
      )),
    [to, classes.navItemActive]
  );

  return (
    <li>
      <ListItem
        button
        component={renderLink}
        className={clsx(classes.navItem, collapsed && classes.navItemCollapsed)}
      >
        {icon ? (
          <ListItemIcon className={classes.navIcon}>{icon}</ListItemIcon>
        ) : null}
        {!collapsed && (
          <ListItemText
            primary={primary}
            primaryTypographyProps={{ variant: "body2", noWrap: true }}
            classes={{ root: classes.navTextRoot, primary: classes.navText }}
          />
        )}
        {adornment}
      </ListItem>
    </li>
  );
}

const MainListItems = (props) => {
  const { drawerClose, collapsed } = props;
  const classes = useStyles();
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
      <ListItemLink
        to="/"
        primary="Dashboard"
        icon={<DashboardOutlinedIcon />}
        collapsed={collapsed}
      />
      <ListItemLink
        to="/connections"
        primary={i18n.t("mainDrawer.listItems.connections")}
        icon={<SyncAltIcon />}
        collapsed={collapsed}
        adornment={
          connectionWarning && (
            <span
              className={clsx(
                classes.connectionDot,
                collapsed && classes.connectionDotCollapsed
              )}
            />
          )
        }
      />
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<WhatsAppIcon />}
        collapsed={collapsed}
      />

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneOutlinedIcon />}
        collapsed={collapsed}
      />
      <ListItemLink
        to="/quickAnswers"
        primary={i18n.t("mainDrawer.listItems.quickAnswers")}
        icon={<QuestionAnswerOutlinedIcon />}
        collapsed={collapsed}
      />
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider className={classes.divider} />
            {!collapsed && (
              <ListSubheader disableSticky className={classes.sectionLabel}>
                {i18n.t("mainDrawer.listItems.administration")}
              </ListSubheader>
            )}
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<PeopleAltOutlinedIcon />}
              collapsed={collapsed}
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<AccountTreeOutlinedIcon />}
              collapsed={collapsed}
            />
            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<SettingsOutlinedIcon />}
              collapsed={collapsed}
            />
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;
