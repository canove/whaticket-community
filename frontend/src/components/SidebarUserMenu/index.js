import React, { useContext, useState } from "react";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

import UserModal from "../UserModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  userButton: {
    gap: theme.spacing(1.25),
    padding: theme.spacing(1, 1.25),
    borderRadius: theme.borderRadius.small,
  },
  userButtonCollapsed: {
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontWeight: 500,
  },
  userProfile: {
    display: "block",
    textTransform: "capitalize",
  },
  expandIcon: {
    color: theme.palette.text.secondary,
  },
}));

const SidebarUserMenu = ({ collapsed }) => {
  const classes = useStyles();
  const { user, handleLogout } = useContext(AuthContext);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <>
      <ListItem
        button
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        className={clsx(
          classes.userButton,
          collapsed && classes.userButtonCollapsed
        )}
      >
        <Avatar>{user.name?.charAt(0)}</Avatar>
        {!collapsed && (
          <>
            <div className={classes.userInfo}>
              <Typography variant="body2" noWrap className={classes.userName}>
                {user.name}
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                noWrap
                className={classes.userProfile}
              >
                {user.profile}
              </Typography>
            </div>
            <ExpandLessIcon fontSize="small" className={classes.expandIcon} />
          </>
        )}
      </ListItem>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
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
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />
    </>
  );
};

export default SidebarUserMenu;
