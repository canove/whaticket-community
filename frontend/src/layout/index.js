import React, { useState, useContext, useEffect } from "react";
import clsx from "clsx";
import {
  Drawer,
  AppBar,
  Toolbar,
  List,
  Divider,
  MenuItem,
  IconButton,
  Menu,
  Avatar,
  Typography,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { Menu as MenuIcon, ChevronLeft, LogOut, User, MessageSquareText } from "lucide-react";

import Tooltip from "@mui/material/Tooltip";
import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import { APP_VERSION, GIT_SHA, BUILD_DATE, formatBuildDate } from "../version";

const drawerWidth = 232;

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getAvatarColor = (name = "") => {
  const colors = [
    { bg: "#DCFCE7", text: "#15803D" },
    { bg: "#EDE9FE", text: "#6D28D9" },
    { bg: "#FEF3C7", text: "#B45309" },
    { bg: "#FCE7F3", text: "#9D174D" },
    { bg: "#DBEAFE", text: "#1D4ED8" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#FAFAF9",
    [theme.breakpoints.down('md')]: {
      height: "calc(100vh - 56px)",
    },
  },

  toolbar: {
    paddingRight: 12,
    paddingLeft: 12,
    gap: 4,
    minHeight: 52,
  },

  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px 0 16px",
    minHeight: "52px",
    borderBottom: "1px solid #F0EEE",
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },

  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#25D366",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    "& svg": {
      color: "#fff",
      fontSize: 17,
    },
  },

  brandName: {
    color: "#292524",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 15.5,
    letterSpacing: "-0.3px",
  },

  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #E7E5E4",
    boxShadow: "none",
    color: "#292524",
  },

  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },

  menuButton: {
    marginRight: 8,
    color: "#78716C",
    "&:hover": {
      color: "#292524",
      backgroundColor: "#F5F5F4",
    },
  },

  menuButtonHidden: {
    display: "none",
  },

  spacer: {
    flexGrow: 1,
  },

  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    backgroundColor: "#FFFFFF",
    borderRight: "1px solid #E7E5E4",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    display: "flex",
    flexDirection: "column",
  },

  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },

  drawerList: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    ...theme.scrollbarStyles,
  },

  drawerFooter: {
    borderTop: "1px solid #E7E5E4",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 11,
    fontWeight: 500,
    color: "#A8A29E",
    letterSpacing: "0.2px",
    userSelect: "none",
    cursor: "default",
  },

  appBarSpacer: {
    minHeight: "52px",
  },

  content: {
    flex: 1,
    overflow: "auto",
    backgroundColor: "#FAFAF9",
    ...theme.scrollbarStyles,
  },

  chevronBtn: {
    color: "#A8A29E",
    width: 28,
    height: 28,
    "&:hover": {
      color: "#292524",
      backgroundColor: "#F5F5F4",
    },
  },

  userButton: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 6px 4px 4px",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "all 0.15s ease",
    "&:hover": {
      backgroundColor: "#F5F5F4",
      border: "1px solid #E7E5E4",
    },
  },

  userAvatar: {
    width: 28,
    height: 28,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: '"DM Sans", system-ui, sans-serif',
  },

  userName: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 13,
    color: "#292524",
    maxWidth: 130,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    [theme.breakpoints.down('md')]: {
      display: "none",
    },
  },

  menuPaper: {
    marginTop: 8,
    borderRadius: "12px !important",
    border: "1px solid #E7E5E4",
    boxShadow: "0 8px 24px rgba(28,25,23,0.1), 0 2px 6px rgba(28,25,23,0.04)",
    minWidth: 188,
    "& .MuiList-padding": {
      padding: "6px",
    },
  },

  menuItem: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
    color: "#292524",
    gap: 10,
    padding: "8px 12px",
    borderRadius: 8,
    margin: "1px 0",
    "&:hover": {
      backgroundColor: "#F5F5F4",
    },
  },

  menuItemIcon: {
    fontSize: 18,
    color: "#78716C",
  },

  menuItemLogout: {
    color: "#DC2626",
    "&:hover": {
      backgroundColor: "#FEF2F2",
    },
    "& $menuItemIcon": {
      color: "#DC2626",
    },
  },

  menuDivider: {
    margin: "4px 8px",
    backgroundColor: "#E7E5E4",
  },
}));

const LoggedInLayout = ({ children }) => {
  const classes = useStyles();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const id = "app-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (document.body.offsetWidth > 600) {
      setDrawerOpen(true);
    }
  }, []);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const drawerClose = () => {
    if (document.body.offsetWidth < 600) {
      setDrawerOpen(false);
    }
  };

  if (loading) {
    return <BackdropLoading />;
  }

  const avatarColors = getAvatarColor(user?.name || "");

  return (
    <div className={classes.root}>
      <Drawer
        variant={drawerVariant}
        className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
        classes={{
          paper: clsx(classes.drawerPaper, !drawerOpen && classes.drawerPaperClose),
        }}
        open={drawerOpen}
      >
        <div className={classes.toolbarIcon}>
          <div className={classes.brandRow}>
            <div className={classes.brandMark}>
              <MessageSquareText size={17} />
            </div>
            {drawerOpen && (
              <span className={classes.brandName}>WhaTicket</span>
            )}
          </div>
          <IconButton
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={classes.chevronBtn}
            size="small"
          >
            <ChevronLeft size={16} />
          </IconButton>
        </div>

        <div className={classes.drawerList}>
          <List disablePadding>
            <MainListItems drawerClose={drawerClose} collapsed={!drawerOpen} />
          </List>
        </div>

        <Tooltip
          title={`git ${GIT_SHA}${BUILD_DATE ? ` • ${formatBuildDate()}` : ""}`}
          placement="top"
          arrow
        >
          <div className={classes.drawerFooter}>
            {drawerOpen ? `v${APP_VERSION}` : `v${APP_VERSION.split(".").pop()}`}
          </div>
        </Tooltip>
      </Drawer>

      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />

      <AppBar
        position="absolute"
        className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
        elevation={0}
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          <IconButton
            edge="start"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={clsx(classes.menuButton, drawerOpen && classes.menuButtonHidden)}
            size="small"
          >
            <MenuIcon size={18} />
          </IconButton>

          <div className={classes.spacer} />

          {user.id && (
            <NotificationsPopOver className={classes.menuButton} />
          )}

          <div
            className={classes.userButton}
            onClick={handleMenu}
            aria-controls="menu-appbar"
            aria-haspopup="true"
          >
            <Avatar
              className={classes.userAvatar}
              style={{
                backgroundColor: avatarColors.bg,
                color: avatarColors.text,
              }}
            >
              {getInitials(user?.name || "")}
            </Avatar>
            <span className={classes.userName}>{user?.name}</span>
          </div>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={menuOpen}
            onClose={handleCloseMenu}
            PaperProps={{ className: classes.menuPaper }}
          >
            <MenuItem onClick={handleOpenUserModal} className={classes.menuItem}>
              <User size={16} className={classes.menuItemIcon} />
              {i18n.t("mainDrawer.appBar.user.profile")}
            </MenuItem>
            <Divider className={classes.menuDivider} />
            <MenuItem
              onClick={handleClickLogout}
              className={clsx(classes.menuItem, classes.menuItemLogout)}
            >
              <LogOut size={16} className={classes.menuItemIcon} />
              {i18n.t("mainDrawer.appBar.user.logout")}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {children ? children : null}
      </main>
    </div>
  );
};

export default LoggedInLayout;
