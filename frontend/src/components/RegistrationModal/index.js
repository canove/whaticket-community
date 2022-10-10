import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
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
import ArchiveIcon from '@material-ui/icons/Archive';
import LanguageIcon from '@material-ui/icons/Language';
import CategoryIcon from '@material-ui/icons/Category';
import TimelineIcon from '@material-ui/icons/Timeline';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import PaymentIcon from '@material-ui/icons/Payment';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '25ch',
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

function getIcon(icon) {
    if (icon === "DashboardOutlinedIcon") {
        return <DashboardOutlinedIcon />;
    }
    else if (icon === "WhatsAppIcon") {
        return <WhatsAppIcon />;
    }
    else if (icon === "SyncAltIcon") {
        return <SyncAltIcon />;
    }
    else if (icon === "SettingsOutlinedIcon") {
        return <SettingsOutlinedIcon />;
    }
    else if (icon === "DvrIcon") {
        return <DvrIcon />;
    }
    else if (icon === "ChatIcon") {
        return <ChatIcon />;
    }
    else if (icon === "ContactPhoneOutlinedIcon") {
        return <ContactPhoneOutlinedIcon />;
    }
    else if (icon === "QuestionAnswerOutlinedIcon") {
        return <QuestionAnswerOutlinedIcon />;
    }
    else if (icon === "ImportExportOutlinedIcon") {
        return <ImportExportOutlinedIcon />;
    }
    else if (icon === "AccountCircleIcon") {
        return <AccountCircleIcon />;
    }
    else if (icon === "PeopleAltOutlinedIcon") {
        return <PeopleAltOutlinedIcon />;
    }
    else if (icon === "AccountTreeOutlinedIcon") {
        return <AccountTreeOutlinedIcon />;
    }
    else if (icon === "EqualizerIcon") {
        return <EqualizerIcon />;
    }
    else if (icon === "AssessmentOutlinedIcon") {
        return <AssessmentOutlinedIcon />
    }
    else if (icon === "ApartmentIcon") {
        return <ApartmentIcon />;
    }
    else if (icon === "ListAltIcon") {
        return <ListAltIcon />
    }
    else if (icon === "MenuIcon") {
        return <MenuIcon />
    }
    else if (icon === "BallotIcon") {
        return <BallotIcon />
    }
    else if (icon === "ArchiveIcon") {
        return <ArchiveIcon/>
    }
    else if (icon === "LanguageIcon") {
        return<LanguageIcon/>
    }
    else if (icon === "CategoryIcon") {
        return<CategoryIcon/>
    }
    else if (icon === "TimelineIcon") {
        return <TimelineIcon />
    }
    else if (icon === "AttachMoneyIcon") {
        return <AttachMoneyIcon />
    }
    else if (icon === "MonetizationOnIcon") {
        return <MonetizationOnIcon />
    }
    else if (icon === "PaymentIcon") {
        return <PaymentIcon />
    }
    else if (icon === "ShoppingCartIcon") {
        return <ShoppingCartIcon />
    }
    else {
        return null;
    }
}

const icons = [
    "DashboardOutlinedIcon",
    "WhatsAppIcon",
    "SyncAltIcon",
    "SettingsOutlinedIcon",
    "DvrIcon",
    "ChatIcon",
    "ContactPhoneOutlinedIcon",
    "QuestionAnswerOutlinedIcon",
    "ImportExportOutlinedIcon",
    "AccountCircleIcon",
    "PeopleAltOutlinedIcon",
    "AccountTreeOutlinedIcon",
    "EqualizerIcon",
    "AssessmentOutlinedIcon",
    "ApartmentIcon",
    "ListAltIcon",
    "MenuIcon",
    "BallotIcon",
    "ArchiveIcon",
    "LanguageIcon",
    "CategoryIcon",
    "TimelineIcon",
    "AttachMoneyIcon",
    "MonetizationOnIcon",
    "PaymentIcon",
    "ShoppingCartIcon",

]

const RegistrationModal = ({ open, onClose, registrationId }) => {
    const { i18n } = useTranslation();
    const classes = useStyles();

    const [icon, setIcon] = useState("");
    const [name, setName] = useState("");
    const [principal, setPrincipal] = useState(false);
    const [relation, setRelation] = useState("");

    const [menus, setMenus] = useState([]);

    useEffect(() => {
        const fetchRegistration = async () => {
            try {
                const { data } = await api.get(`/menus/${registrationId}`);
                setIcon(data.icon);
                setName(data.name);
                setPrincipal(data.isParent);
                setRelation(data.parentId);
            } catch (err) {
                toastError(err);
            }
        };

        const fetchMenus = async () => {
            try {
                const { data } = await api.get('/menus/');
                setMenus(data.menus);
            } catch (err) {
                toastError(err);
            }
        }

        if (registrationId) {
            fetchRegistration();
        }

        fetchMenus();
    }, [registrationId, open]);

    const handleClose = () => {
        onClose();
        setIcon("");
        setName("");
        setPrincipal(false);
        setRelation("");
    };

    const handleSubmit = async () => {
        const menuData = {
            icon: icon,
            name: name,
            isParent: principal,
            parentId: relation || null
        };

        try {
            if (registrationId) {
                await api.put(`/menus/${registrationId}`, menuData);
                toast.success(i18n.t("registration.confirmation.update"));
            } else {
                await api.post("/menus/", menuData);
                toast.success(i18n.t("registration.confirmation.created"));
            }
            } catch (err) {
                toastError(err);
        }
        handleClose();
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
    }

    const handlePrincipalChange = (e) => {
        setPrincipal(e.target.value);
    }

    const handleRelationChange = (e) => {
        setRelation(e.target.value);
    }

    const handleIconChange = (e) => {
        setIcon(e.target.value);
    }

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
                    { registrationId
                     ? `${i18n.t("registration.registrationModal.edit")}`
                     : `${i18n.t("registration.registrationModal.add")}`
                    }
                </DialogTitle>
                <DialogContent dividers>
                    <div>
                        <TextField
                            label={i18n.t("registration.registrationModal.name")}
                            placeholder={i18n.t("registration.registrationModal.name")}
                            fullWidth
                            margin="normal"
                            style={{ margin: 8 }}
                            InputLabelProps={{
                            shrink: true,
                            }}
                            variant="outlined"
                            value={name}
                            onChange={(e) => { handleNameChange(e) }}
                        />
                    </div>
                    <div>
                        <FormControl
                            variant="outlined"
                            className={classes.formControl}
                            margin="dense"
                            fullWidth
                        >
                            <InputLabel>{i18n.t("registration.registrationModal.icon")}</InputLabel>
                            <Select
                                value={icon}
                                onChange={(e) => { handleIconChange(e) }}
                                label="Icon"
                            >
                                { icons && icons.map((icon, index) => {
                                    return (
                                        <MenuItem key={index} value={icon}>{getIcon(icon)} {`${icon}`}</MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </div>
                    <div>
                        <FormControl
                            variant="outlined"
                            className={classes.formControl}
                            margin="dense"
                            fullWidth
                        >
                            <InputLabel>{i18n.t("registration.registrationModal.main")}</InputLabel>
                            <Select
                                value={principal}
                                onChange={(e) => { handlePrincipalChange(e) }}
                                label="Principal"
                            >
                                <MenuItem value={true}>{i18n.t("registration.registrationModal.yes")}</MenuItem>
                                <MenuItem value={false}>{i18n.t("registration.registrationModal.no")}</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div>
                        <FormControl
                            variant="outlined"
                            className={classes.formControl}
                            margin="dense"
                            fullWidth
                        >
                            <InputLabel>{i18n.t("registration.registrationModal.relation")}</InputLabel>
                            <Select
                                value={relation}
                                onChange={(e) => { handleRelationChange(e) }}
                                label="Relation"
                            >
                              <MenuItem value="">{i18n.t("registration.registrationModal.none")}</MenuItem>
                              { menus && menus.map(menu => {
                                  if (menu.isParent) {
                                      return (
                                          <MenuItem key={menu.id} value={menu.id}>{menu.name}</MenuItem>
                                      );
                                  }
                              })}
                            </Select>
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        color="secondary"
                        variant="outlined"
                    >
                        {i18n.t("registration.registrationModal.cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                    >
                        { registrationId
                         ? `${i18n.t("registration.registrationModal.save")}`
                         : `${i18n.t("registration.registrationModal.created")}`
                        }
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RegistrationModal;
