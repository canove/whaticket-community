import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },

  container: {
    display: "flex",
    flexWrap: "wrap",
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },

  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
    alignItems: "center",
  },
}));

const ProfileModal = ({ open, onClose, profileId }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();

  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [menus, setMenus] = useState([]);
  
  const [allMenus, setAllMenus] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) return;
      try {
        const { data } = await api.get(`/profile/${profileId}`);
        setName(data.name);
        setPermissions(JSON.parse(data.permissions));
        setMenus(JSON.parse(data.menus));
      } catch (err) {
        toastError(err);
      }
    };

    const fetchMenus = async () => {
      try {
        const { data } = await api.get(`/menus/company`);
        setAllMenus(data);
      } catch (err) {
        toastError(err);
      }
    }

    fetchProfile();
    fetchMenus();
  }, [open, profileId]);

  const handleClose = () => {
    setName("");
    setPermissions([]);
    setMenus([]);

    onClose();
  };

  const handleSubmit = async () => {
    const profileData = {
      name,
      menus,
      permissions,
    };

    try {
      if (profileId) {
        await api.put(`/profile/${profileId}`, profileData);
        toast.success("Perfil editado com sucesso!");
      } else {
        await api.post(`/profile/`, profileData);
        toast.success("Perfil criado com sucesso!");
      }
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {profileId ? `Editar perfil` : `Criar perfil`}
        </DialogTitle>
        <DialogContent dividers>
          <div className={classes.multFieldLine}>
            <TextField
              as={TextField}
              label={"Nome"}
              autoFocus
              value={name}
              name="name"
              onChange={(e) => {
                setName(e.target.value);
              }}
              variant="outlined"
              margin="dense"
              fullWidth
            />
          </div>
          <div className={classes.multFieldLine}>
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="permissions-select-label">Permissões</InputLabel>
              <Select
                variant="outlined"
                labelId="permissions-select-label"
                id="permissions-select"
                value={permissions}
                label="Permissões"
                onChange={(e) => {
                  setPermissions(e.target.value);
                }}
                multiple
                style={{ width: "100%" }}
              >
                {/* <MenuItem value={"drawer-admin-items:view"}>
                  drawer-admin-items:view
                </MenuItem> */}
                <MenuItem value={"tickets-manager:showall"}>
                  Ver Todas as Chamadas
                </MenuItem>
                {/* <MenuItem value={"ticket-options:deleteTicket"}>
                  Deletar Chamadas
                </MenuItem> */}
                <MenuItem value={"user-modal:editProfile"}>
                  Editar Perfil (Usuários)
                </MenuItem>
                <MenuItem value={"user-modal:editQueues"}>
                  Editar Filas (Usuários)
                </MenuItem>
                {/* <MenuItem value={"contacts-page:deleteContact"}>
                  contacts-page:deleteContact
                </MenuItem> */}
              </Select>
            </FormControl>
          </div>
          <div className={classes.multFieldLine}>
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="menus-select-label">Menus</InputLabel>
              <Select
                variant="outlined"
                labelId="menus-select-label"
                id="menus-select"
                value={menus}
                label="Menus"
                onChange={(e) => {
                  setMenus(e.target.value);
                }}
                multiple
                style={{ width: "100%" }}
              >
                { allMenus && allMenus.map((menu) => {
                  if (!menu.isParent) {
                    return (
                      <MenuItem value={menu.id} key={menu.id}>
                        {menu.name}
                      </MenuItem>
                    )
                  }
                }) }
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="outlined">
            {"Cancelar"}
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            className={classes.btnWrapper}
            onClick={handleSubmit}
          >
            {profileId ? `Salvar` : `Criar`}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProfileModal;
