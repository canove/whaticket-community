import React, { useEffect, useReducer, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import { useTranslation } from "react-i18next";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import {IconButton,
        TextField,
        InputAdornment,
        Button,
} from "@material-ui/core";
import { DeleteOutline } from "@material-ui/icons";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import openSocket from "../../services/socket-io";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import SearchIcon from "@material-ui/icons/Search";
import { format, parseISO } from "date-fns";
import EditIcon from "@material-ui/icons/Edit";
import RegistrationModal from "../../components/RegistrationModal";

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
    display: "inline-flex",
    width: 200,
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  multFieldLine: {
    width: 200,
    flexDirection: "column",
    display: "flex"
  },
  divStyle: {
    width: 300,
  },
  titleStyle: {
    marginLeft: 20,
    marginTop: 5,
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_REGISTRATION") {
    const menus = action.payload;
    const newRegistrations = [];

    menus.forEach((registration) => {
      const registrationIndex = state.findIndex((u) => u.id === registration.id);
      if (registrationIndex !== -1) {
        state[registrationIndex] = registration;
      } else {
        newRegistrations.push(registration);
      }
    });

    return [...state, ...newRegistrations];
  }

  if (action.type === "UPDATE_REGISTRATION") {
    const registration = action.payload;
    const registrationIndex = state.findIndex((u) => u.id === registration.id);

    if (registrationIndex !== -1) {
      state[registrationIndex] = registration;
      return [...state];
    } else {
      return [registration, ...state];
    }
  }

  if (action.type === "DELETE_REGISTRATION") {
    const registrationId = action.payload;

    const registrationIndex = state.findIndex((u) => u.id === registrationId);
    if (registrationIndex !== -1) {
      state.splice(registrationIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Registration = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [registrations, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [deletingMenu, setDeletingMenu] = useState(null);


  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchRegistration = async () => {
        try {
          const { data } = await api.get("/menus/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_REGISTRATION", payload: data.menus });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
          setLoading(false);
        }
      };
      fetchRegistration();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = openSocket();
    socket.on("menu", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_REGISTRATION", payload: data.menu });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_REGISTRATION", payload: + data.menusId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleSearch = (e) => {
    setSearchParam(e.target.value.toLowerCase());
  };

 const handleRegistrationModal = () => {
    setSelectedRegistration(null);
    setRegistrationModalOpen(true);
  };

  const handleCloseRegistrationModal = () => {
    setSelectedRegistration(null);
    setRegistrationModalOpen(false);
  };

  const handleEditRegistration = (registration) => {
    setSelectedRegistration(registration);
    setRegistrationModalOpen(true);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleDeleteMenu = async () => {
    try {
      await api.delete(`/menus/${deletingMenu.id}`);
      toast.success(i18n.t("registration.confirmation.delete"));
    } catch (err) {
      toastError(err);
      }
    setDeletingMenu(null);
    setSearchParam("");
    setPageNumber(1);
  };

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

const getParent = (id) => {
  let parentName;
  registrations.forEach((registration) => {
    if (registration.id == id) {
      parentName = registration.name;
    }
  })
  return parentName;
}

const getIsParent = (isParent) => {
  if (isParent === true) {
    return `${i18n.t("registration.registrationModal.yes")}`;
  }
  if (isParent === false) {
    return `${i18n.t("registration.registrationModal.no")}`;
  }
  return isParent;
}

  return (
    <MainContainer>
        <RegistrationModal
            open={registrationModalOpen}
            onClose={handleCloseRegistrationModal}
            aria-labelledby="form-dialog-title"
            registrationId={selectedRegistration && selectedRegistration.id}
      >
      </RegistrationModal>
        <ConfirmationModal
            title={
            deletingMenu &&
            `${i18n.t("registration.confirmation.title")}`}
            open={confirmModalOpen}
            onClose={setConfirmModalOpen}
            onConfirm={() => handleDeleteMenu(deletingMenu.id)}
        >
          {i18n.t("registration.confirmation.confirmDelete")}
      </ConfirmationModal>
      <MainHeader>
        <div className={classes.titleStyle}>
          <Title>{i18n.t("registration.title")}</Title>
        </div>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("registration.buttons.search")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
            <Button
                variant="contained"
                color="primary"
                onClick={handleRegistrationModal}
           >
            {i18n.t("registration.buttons.new")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("registration.grid.icon")}</TableCell>
              <TableCell align="center">{i18n.t("registration.grid.name")}</TableCell>
              <TableCell align="center">{i18n.t("registration.grid.main")}</TableCell>
              <TableCell align="center">{i18n.t("registration.grid.relation")}</TableCell>
              <TableCell align="center">{i18n.t("registration.grid.createdAt")}</TableCell>
              <TableCell align="center">{i18n.t("registration.grid.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {registrations && registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell align="center">{getIcon(registration.icon)}</TableCell>
                    <TableCell align="center">{registration.name}</TableCell>
                    <TableCell align="center">{getIsParent(registration.isParent)}</TableCell>
                    <TableCell align="center">{getParent(registration.parentId)}</TableCell>
                    <TableCell align="center">{format(parseISO(registration.createdAt), "dd/MM/yy HH:mm")}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleEditRegistration(registration)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setDeletingMenu(registration);
                          setConfirmModalOpen(true);
                        }}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {loading && <TableRowSkeleton columns={6} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Registration;
