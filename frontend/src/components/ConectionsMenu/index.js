import React, { useEffect, useRef, useState } from "react";

import CircularProgress from "@material-ui/core/CircularProgress";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const ConectionsMenu = ({ whatsApp, menuOpen, handleClose, anchorEl }) => {
  const [syncContactsIsActived, setSyncContactsIsActived] = useState(false);
  const [syncGroupContactsTable, setSyncGroupContactsTableActived] =
    useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuOpen}
        onClose={handleClose}
      >
        <MenuItem
          disabled={syncContactsIsActived}
          onClick={async () => {
            setSyncContactsIsActived(true);
            try {
              await api.post(
                `/whatsappsession/updateWppChatslastMessageTimestamp/${whatsApp.id}`
              );
              setSyncContactsIsActived(false);
              toast.success("Sincronización de contactos realizada con exito!");
            } catch (err) {
              toastError(err);
              setSyncContactsIsActived(false);
            }
          }}
        >
          {syncContactsIsActived && <CircularProgress />}
          Sincronizar timestamp de tickets
        </MenuItem>
        <MenuItem
          disabled={syncGroupContactsTable}
          onClick={async () => {
            setSyncGroupContactsTableActived(true);

            console.log("whatsApp.id", whatsApp.id);
            try {
              await api.post(
                `/whatsappsession/syncGroupContactsTable/${whatsApp.id}`
              );
              setSyncGroupContactsTableActived(false);
              toast.success("Sincronización de contactos realizada con exito!");
            } catch (err) {
              toastError(err);
              setSyncGroupContactsTableActived(false);
            }
          }}
        >
          {syncGroupContactsTable && <CircularProgress />}
          Sincronizar integrantes de grupos (BD)
        </MenuItem>
      </Menu>
    </>
  );
};

export default ConectionsMenu;
