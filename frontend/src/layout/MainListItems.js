import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink, useMatch } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles';

import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import { Badge } from "@mui/material";
import {
  LayoutDashboard,
  MessageSquare as WhatsAppNavIcon,
  ArrowLeftRight,
  Settings,
  Users,
  BookUser,
  GitBranch,
  MessageCircle,
  Briefcase,
} from "lucide-react";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";

const useStyles = makeStyles(() => ({
  listItem: {
    borderRadius: 9,
    margin: "1px 8px",
    width: "calc(100% - 16px)",
    padding: "8px 10px",
    transition: "background-color 0.15s ease",
    "&:hover": {
      backgroundColor: "#F5F5F4",
    },
  },
  listItemActive: {
    backgroundColor: "rgba(37,211,102,0.08) !important",
    "&:hover": {
      backgroundColor: "rgba(37,211,102,0.12) !important",
    },
  },
  listItemIcon: {
    minWidth: 34,
    color: "#A8A29E",
    "& svg": {
      fontSize: 18,
    },
  },
  listItemIconActive: {
    color: "#1DAB57",
  },
  listItemText: {
    "& span": {
      color: "#57534E",
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontWeight: 500,
      fontSize: 13.5,
    },
  },
  listItemTextActive: {
    "& span": {
      color: "#1C1917",
      fontWeight: 600,
    },
  },
  activeBar: {
    position: "absolute",
    left: 8,
    top: "50%",
    transform: "translateY(-50%)",
    width: 3,
    height: 20,
    borderRadius: 2,
    background: "#25D366",
  },
  divider: {
    backgroundColor: "#E7E5E4",
    margin: "6px 0",
  },
  subheader: {
    color: "#A8A29E",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 10.5,
    letterSpacing: "0.7px",
    textTransform: "uppercase",
    lineHeight: "30px",
    background: "transparent",
    paddingLeft: 18,
  },
  navGroup: {
    paddingTop: 6,
    paddingBottom: 2,
  },
}));

function ListItemLink({ icon, primary, to, className, activeClassName, activeItemClass,
  iconClass, activeIconClass, textClass, activeTextClass, collapsed }) {
  const classes = useStyles();
  const match = useMatch(to === "/" ? { path: to, end: true } : { path: to });

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  const isActive = !!match;

  const item = (
    <li style={{ listStyle: "none", position: "relative" }}>
      {isActive && <span className={activeClassName} />}
      <ListItem
        button
        component={renderLink}
        className={`${className} ${isActive ? activeItemClass : ""}`}
      >
        <ListItemIcon className={`${iconClass} ${isActive ? activeIconClass : ""}`}>
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={primary}
          className={`${textClass} ${isActive ? activeTextClass : ""}`}
        />
      </ListItem>
    </li>
  );

  if (collapsed) {
    return (
      <Tooltip title={primary} placement="right" arrow>
        {item}
      </Tooltip>
    );
  }

  return item;
}

const MainListItems = ({ drawerClose, collapsed }) => {
  const classes = useStyles();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) =>
          ["qrcode", "PAIRING", "DISCONNECTED", "TIMEOUT", "OPENING"].includes(whats.status)
        );
        setConnectionWarning(offlineWhats.length > 0);
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const commonItemProps = {
    className: classes.listItem,
    activeItemClass: classes.listItemActive,
    iconClass: classes.listItemIcon,
    activeIconClass: classes.listItemIconActive,
    textClass: classes.listItemText,
    activeTextClass: classes.listItemTextActive,
    activeClassName: classes.activeBar,
    collapsed,
  };

  return (
    <div onClick={drawerClose} className={classes.navGroup}>
      <ListItemLink
        to="/"
        primary="Dashboard"
        icon={<LayoutDashboard size={18} />}
        {...commonItemProps}
      />
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <ListItemLink
            to="/connections"
            primary={i18n.t("mainDrawer.listItems.connections")}
            icon={
              <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                <ArrowLeftRight size={18} />
              </Badge>
            }
            {...commonItemProps}
          />
        )}
      />
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<WhatsAppNavIcon size={18} />}
        {...commonItemProps}
      />
      <ListItemLink
        to="/crm"
        primary="CRM"
        icon={<Briefcase size={18} />}
        {...commonItemProps}
      />
      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<BookUser size={18} />}
        {...commonItemProps}
      />
      <ListItemLink
        to="/quickAnswers"
        primary={i18n.t("mainDrawer.listItems.quickAnswers")}
        icon={<MessageCircle size={18} />}
        {...commonItemProps}
      />
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider className={classes.divider} />
            <ListSubheader className={classes.subheader} disableSticky>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<Users size={18} />}
              {...commonItemProps}
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<GitBranch size={18} />}
              {...commonItemProps}
            />
            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<Settings size={18} />}
              {...commonItemProps}
            />
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;
