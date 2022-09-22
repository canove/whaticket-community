import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
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
  ListItemIcon,
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";

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
import ListAltIcon from '@material-ui/icons/ListAlt';
import MenuIcon from '@material-ui/icons/Menu';
import BallotIcon from '@material-ui/icons/Ballot';

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  multFieldLine: {
    display: "flex",
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
}));

const RegistrationModal = ({ open, onClose, registrationId }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();
  const initialState = {
    icon: "",
    name:"",
    main: "",
    relationship: "",
  };
  const [menus, setMenus] = useState(initialState);
  const [select, setSelect] = useState([]);
  const [name , setName] = useState([]);
  const [selectIcon, setSelectIcon] = useState(false);

  const [principal, setPrincipal] = useState(false);
  const icons = [   "DashboardOutlinedIcon",
                "WhatsAppIcon",
                "SyncAltIcon",
                "SettingsOutlinedIcon",
                "DvrIcon",
                "ChatIcon",
                "ContactPhoneOutlinedIcon",
                "QuestionAnswerOutlinedIcon",
                "ImportExportOutlinedIcon",
                "AccountCircleIcon",
                "EqualizerIcon",
                "AssessmentOutlinedIcon",
                "ListAltIcon",
                "MenuIcon",
                "BallotIcon",
    ]

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const { data } = await api.get(`/menus/${registrationId}`);
        setPrincipal(data.isParent);
        setSelectIcon(data.icon);
        setMenus((prevState) => {
          return { ...prevState, ...data, select};
        });
      } catch (err) {
        toastError(err);
      }
    };
    if (registrationId) {
      fetchRegistration();
    }
  }, [registrationId, open]);

  const handleClose = () => {
    onClose();
    setMenus(initialState);
    setPrincipal(false);
    setSelectIcon(false);
  };

  const handleChangeSelect = (e) => {
		setSelect(e.target.value);
	};

  const handleChangePrincipal = (e) => {
    setPrincipal(e.target.value);
  }

  const handleSubmit = async (values) => {
    const menuData = { ...values };
    try {
      if (registrationId) {
        await api.put(`/menus/${registrationId}`, menuData);
      } else {
        await api.post("menus/", menuData);
      }
      toast.success(i18n.t("Menu adicionado com sucesso!"));
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

    const handleNameChange = () => {
        setName();
    };

    const hadleSelectIcon = (e) => {
        setSelectIcon(e.target.value)
    };

function getIcon(icon) {
  if (icon === "DashboardOutlinedIcon") {
    return <DashboardOutlinedIcon />;
  } else if (icon === "WhatsAppIcon") {
    return <WhatsAppIcon />;
  } else if (icon === "SyncAltIcon") {
    return <SyncAltIcon />;
  } else if (icon === "SettingsOutlinedIcon") {
    return <SettingsOutlinedIcon />;
  } else if (icon === "DvrIcon") {
    return <DvrIcon />;
  } else if (icon === "ChatIcon") {
    return <ChatIcon />;
  } else if (icon === "ContactPhoneOutlinedIcon") {
    return <ContactPhoneOutlinedIcon />;
  } else if (icon === "QuestionAnswerOutlinedIcon") {
    return <QuestionAnswerOutlinedIcon />;
  } else if (icon === "ImportExportOutlinedIcon") {
    return <ImportExportOutlinedIcon />;
  } else if (icon === "AccountCircleIcon") {
    return <AccountCircleIcon />;
  } else if (icon === "PeopleAltOutlinedIcon") {
    return <PeopleAltOutlinedIcon />;
  } else if (icon === "AccountTreeOutlinedIcon") {
    return <AccountTreeOutlinedIcon />;
  } else if (icon === "EqualizerIcon") {
    return <EqualizerIcon />;
  } else if (icon === "AssessmentOutlinedIcon") {
    return <AssessmentOutlinedIcon />
  } else if (icon === "ApartmentIcon") {
    return <ApartmentIcon />;
  } else if (icon === "ListAltIcon") {
    return <ListAltIcon />
  } else if (icon === "MenuIcon") {
    return <MenuIcon />
  } else if (icon === "BallotIcon") {
    return <BallotIcon />
  } else {
    return null;
  }
}

const getMenuName = (menuName) => {
    if(menuName === "Dashboard"){
      return i18n.t("Dashboard")
    }if(menuName === "Official Connections"){
      return i18n.t("Conexões Oficiais")
    }if(menuName === "Templates"){
      return i18n.t("Templates")
    }if(menuName === "Connections"){
      return i18n.t("Conexões")
    }if(menuName === "Templates Data"){
      return i18n.t("Templates Data")
    }if(menuName === "Whats Config"){
      return i18n.t("Configurações")
    }if(menuName === "Tickets"){
      return i18n.t("Chamadas")
    }if(menuName === "Contacts"){
      return i18n.t("Contatos")
    }if(menuName === "Quick Answers"){
      return i18n.t("Respostas Rápidas")
    }if(menuName === "Importation"){
      return i18n.t("Importação")
    }if(menuName === "Administration"){
      return i18n.t("Administração")
    }if(menuName === "Users"){
      return i18n.t("Usuário")
    }if(menuName === "Company"){
      return i18n.t("Empresa")
    }if(menuName === "Menus"){
      return i18n.t("Menus")
    }if(menuName === "Menu Link"){
      return i18n.t("Vínculo de Menus")
    }if(menuName === "Registration"){
      return i18n.t("Cadastro")
    }if(menuName === "Queues"){
      return i18n.t("Filas")
    }if(menuName === "Setting"){
      return i18n.t("Configurações")
    }if(menuName === "Reports"){
      return i18n.t("Relatórios Conversa")
    }if(menuName === "Talk Reports"){
      return i18n.t("Relatórios Conversa")
    }if(menuName === "Reports Ticket"){
      return i18n.t("Relatórios Chamadas")
    }if(menuName === "Registers Reports"){
      return i18n.t("Relatório Registro")
    }return menuName
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {registrationId
            ? `${i18n.t("Editar")}`
            : `${i18n.t("Adicionar")}`}
        </DialogTitle>
        <Formik
          initialValues={menus}
          enableReinitialize={true}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSubmit(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <div>
                    <FormControl
                        variant="outlined"
                        margin="dense"
                        fullWidth
                    >
                        <InputLabel id="icon-selection-label">{i18n.t("Ícone")}</InputLabel>
                        <Select
                            label={i18n.t("Ícone")}
                            name="icon"
                            labelId="icon-selection-label"
                            id="icon-selection"
                            onChange={(e) => { hadleSelectIcon(e) }}
                            value={selectIcon}
                        >
                            {icons && icons.map((icon) => <MenuItem key={icon.id}>{ getIcon(icon) }{getMenuName(menuName)}</MenuItem>)}
                        </Select>
                    </FormControl>
                </div>
                 <div>
                    <TextField
                      value={name}
                      onChange={(e) => { handleNameChange(e) }}
                      variant="outlined"
                      fullWidth
                    />
                </div>
                 <div>
                 <FormControl
                  variant="outlined"
                  margin="dense"
                  fullWidth
                 >
                    <InputLabel id="principal-label">Principal</InputLabel>
                    <Select
                      labelId="principal-label"
                      label="Principal"
                      variant="outlined"
                      fullWidth
                      onChange={(e) => { handleChangePrincipal(e) }}
                      value={principal}
                    >
                      <MenuItem value={false}>Não</MenuItem>
                      <MenuItem value={true}>Sim</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                 <div>
                    <FormControl
                        variant="outlined"
                        margin="dense"
                        fullWidth
                    >
                        <InputLabel id="relationship-selection-label">{i18n.t("Relação")}</InputLabel>
                        <Select
                            label={i18n.t("Relação")}
                            name="relationship"
                            labelId="relationship-selection-label"
                            id="relationship-selection"
                            onChange={handleChangeSelect}
                        >
                        <MenuItem></MenuItem>
                        </Select>
                    </FormControl>
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                  disabled={isSubmitting}
                >
                   {registrationId
                    ? `${i18n.t("Editar")}`
                    : `${i18n.t("Adicionar")}`}
                </Button>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("templates.buttons.cancel")}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default RegistrationModal;
