import React, { useState, useContext, useEffect } from "react";
import clsx from "clsx";
import {
  makeStyles,
  Drawer,
  AppBar,
  Toolbar,
  List,
  IconButton,
  useMediaQuery,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import MenuOpenIcon from "@material-ui/icons/MenuOpen";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import SidebarUserMenu from "../components/SidebarUserMenu";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import { useThemeContext } from "../context/DarkMode";
import logo from "../assets/whaticket-logo-white.png";

const drawerWidth = 280;
const drawerCollapsedWidth = 92;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    [theme.breakpoints.down("sm")]: {
      height: "100dvh",
    },
  },
  toolbar: {
    minHeight: theme.sizing.appBar,
    paddingRight: 24, // keep right padding when drawer closed
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.appBar.background,
  },
  menuButton: {
    marginRight: 36,
    color: theme.palette.common.white,
  },
  logo: {
    height: 30,
  },
  grow: {
    flexGrow: 1,
  },
  headerIcon: {
    color: theme.palette.common.white,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: drawerCollapsedWidth,
  },
  drawerSurface: {
    padding: theme.spacing(2, 0, 2, 2),
    backgroundColor: "transparent",
  },
  drawerDocked: {
    borderRight: 0,
  },
  sidebarCard: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1, 1.75),
    backgroundColor: theme.palette.cards.background,
    border: theme.border.divider,
    borderRadius: theme.borderRadius.medium,
    overflow: "hidden",
  },
  navList: {
    flex: 1,
    overflowX: "hidden",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  sidebarFooter: {
    borderTop: theme.border.divider,
    paddingTop: theme.spacing(1),
  },
  appBarSpacer: {
    minHeight: theme.sizing.appBar,
  },
  content: {
    flex: 1,
    overflow: "auto",
  },
}));

const LoggedInLayout = ({ children }) => {
  const classes = useStyles();
  const { loading } = useContext(AuthContext);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("xs"), {
    noSsr: true,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useThemeContext();

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const drawerClose = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose,
            classes.drawerSurface
          ),
          paperAnchorDockedLeft: classes.drawerDocked,
        }}
        open={drawerOpen}
      >
        <div className={classes.appBarSpacer} />
        <div className={classes.sidebarCard}>
          <List className={classes.navList}>
            <MainListItems drawerClose={drawerClose} collapsed={!drawerOpen} />
          </List>
          <div className={classes.sidebarFooter}>
            <SidebarUserMenu collapsed={!drawerOpen} />
          </div>
        </div>
      </Drawer>
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar variant="dense" className={classes.toolbar}>
          <IconButton
            edge="start"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={classes.menuButton}
          >
            {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
          <img src={logo} alt="Whaticket" className={classes.logo} />
          <div className={classes.grow} />

          <IconButton
            aria-label={i18n.t("mainDrawer.appBar.darkMode")}
            onClick={toggleTheme}
            className={classes.headerIcon}
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {user.id && <NotificationsPopOver />}
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
