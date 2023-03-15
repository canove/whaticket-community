import React, { useState, useContext, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next'
import clsx from "clsx";

import {
  makeStyles,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  MenuItem,
  IconButton,
  Menu,
} from "@material-ui/core";

import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import AccountCircle from "@material-ui/icons/AccountCircle";

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

import { IconFlagBR, IconFlagUS, IconFlagES } from 'material-ui-flags';

import brainit from "../assets/brainit400.png";
import api from "../services/api";
import toastError from "../errors/toastError";

const drawerWidth = 320;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    [theme.breakpoints.down("sm")]: {
      height: "calc(100vh - 56px)",
    },
  },

  toolbar: {
    display: "flex",
    paddingRight: 24, // keep right padding when drawer closed
    backgroundColor: "#F5F5F5",
    color: "#363636",
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    minHeight: "48px",

  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    display: "flex",
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
    display: "flex",

  },
  drawerPaper: {
    backgroundColor: "#F5F5F5",
    color: "#363636",
    position: "relative",
    whiteSpace: "nowrap",
    width: theme.spacing(40),
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
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(7),
    },
  },
  appBarSpacer: {
    minHeight: "48px",
  },
  content: {
    flex: 1,
    overflow: "auto",
    paddingTop: 5,
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",

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
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const [logo, setLogo] = useState("");
  const [language, setLanguage] = useState("");

// eslint-disable-next-line react-hooks/exhaustive-deps
  const mainListItems = useMemo(() => <MainListItems drawerOpen={drawerOpen} />, [user, drawerOpen])

  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await api.get(`/companies/${user.companyId}`);
        setLogo(data.logo);
      } catch (err) {
        toastError(err);
      }
    }
    if (user.companyId) {
      fetchLogo();
    }
  }, [user.companyId])

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

  useEffect(() => {
    const saveLanguage = async () => {
      if (!user.id) return;

      try {
        await api.put(`/users/language/${user.id}`, { language });
        i18n.changeLanguage(language);
      } catch (err) {
        toastError(err);
      }
    }

    saveLanguage();
  }, [language])

  const handleChangeLanguage = (language) => {
    // i18n.changeLanguage(language);
    setLanguage(language);
    handleCloseLanguageMenu();
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleLanguageMenu = (event) => {
    setLanguageAnchorEl(event.currentTarget);
    setLanguageMenuOpen(true);
  }

  const handleCloseLanguageMenu = () => {
    setLanguageAnchorEl(null);
    setLanguageMenuOpen(false);
  }

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  // const drawerClose = () => {
  //   if (document.body.offsetWidth < 600) {
  //     setDrawerOpen(false);
  //   }
  // };

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>
      <Drawer
        variant={drawerVariant}
        className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose
          ),
        }}
        open={drawerOpen}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          { mainListItems }
        </List>
        <Divider />
      </Drawer>
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
        color={process.env.NODE_ENV === "development" ? "inherit" : "primary"}
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={clsx(
              classes.menuButton,
              drawerOpen && classes.menuButtonHidden
            )}
          >
            <MenuIcon/>
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          ><img src={ logo ? logo : brainit } height="50px" style={{paddingTop: "5px", paddingBottom: "5px"}}  alt="Logo"/>
          </Typography>
          {user.id && <NotificationsPopOver />}

          <div>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={menuOpen}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleOpenUserModal}>
                {i18n.t("mainDrawer.appBar.user.profile")}
              </MenuItem>
              <MenuItem onClick={handleClickLogout}>
                {i18n.t("mainDrawer.appBar.user.logout")}
              </MenuItem>
            </Menu>
          </div>
          <div>
            <IconButton
              onClick={handleLanguageMenu}
            >
              {i18n.language === 'pt' &&
                <IconFlagBR />
              }
              {i18n.language === 'en' &&
                <IconFlagUS />
              }
              {i18n.language === 'es' &&
                <IconFlagES />
              }
            </IconButton>
            <Menu
              anchorEl={languageAnchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={languageMenuOpen}
              onClose={handleCloseLanguageMenu}
            >
              <MenuItem onClick={() => handleChangeLanguage('pt')}><IconButton><IconFlagBR /></IconButton></MenuItem>
              <MenuItem onClick={() => handleChangeLanguage('en')}><IconButton><IconFlagUS /></IconButton></MenuItem>
              <MenuItem onClick={() => handleChangeLanguage('es')}><IconButton><IconFlagES /></IconButton></MenuItem>
            </Menu>
          </div>
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
