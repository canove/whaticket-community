import React, { useContext, useEffect, useRef, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Badge from "@material-ui/core/Badge";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";

import { AuthContext } from "../../context/Auth/AuthContext";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { Button, FormControl, ListItemText, MenuItem, Select } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import Can from "../Can";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  tabsHeader: {
    flex: "none",
    backgroundColor: "#eee",
  },

  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: 8,
  },

  tab: {
    minWidth: 120,
    width: 120,
  },

  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fafafa",
    padding: theme.spacing(1),
  },

  serachInputWrapper: {
    flex: 1,
    background: "#fff",
    display: "flex",
    borderRadius: 40,
    padding: 4,
    marginRight: theme.spacing(1),
  },

  searchIcon: {
    color: "grey",
    marginLeft: 6,
    marginRight: 6,
    alignSelf: "center",
  },

  searchInput: {
    flex: 1,
    border: "none",
    borderRadius: 30,
  },

  badge: {
    right: "-5px",
  },
  show: {
    display: "block",
  },
  hide: {
    display: "none !important",
  },
}));

const TicketsManager = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingAnswerCount, setPendingAnswerCount] = useState(0);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    // if (user.profile.toUpperCase() === "ADMIN") {
    //   setShowAllTickets(true);
    // }

    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/category/");
        setCategories(data);
      } catch (err) {
        toastError(err);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
      setSearchParam("");
    }
  }, [tab]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      setTab("open");
      return;
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
    }, 500);
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const handleCategoryChange = e => {
		setCategoryId(e.target.value);
	};

  return (
    <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(e) => setNewTicketModalOpen(false)}
      />
      <Paper elevation={0} square className={classes.tabsHeader}>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
        >
          <Tab
            value={"open"}
            icon={<MoveToInboxIcon />}
            label={i18n.t("tickets.tabs.open.title")}
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"closed"}
            icon={<CheckBoxIcon />}
            label={i18n.t("tickets.tabs.closed.title")}
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"search"}
            icon={<SearchIcon />}
            label={i18n.t("tickets.tabs.search.title")}
            classes={{ root: classes.tab }}
          />
        </Tabs>
      </Paper>
      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        {tab === "search" && (
          <>
            <div className={classes.serachInputWrapper}>
              <SearchIcon className={classes.searchIcon} />
              <InputBase
                className={classes.searchInput}
                inputRef={searchInputRef}
                placeholder={i18n.t("tickets.search.placeholder")}
                type="search"
                onChange={handleSearch}
              />
            </div>
            <TicketsQueueSelect
              style={{ marginLeft: 6 }}
              selectedQueueIds={selectedQueueIds}
              userQueues={user?.queues}
              onChange={(values) => setSelectedQueueIds(values)}
            />
          </>
        )}
        {tab === "open" && (
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setNewTicketModalOpen(true)}
            >
              {i18n.t("ticketsManager.buttons.newTicket")}
            </Button>
            <Can
              permission="tickets-manager:showall"
              item={
                <FormControlLabel
                  label={i18n.t("tickets.buttons.showAll")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={showAllTickets}
                      onChange={() =>
                        setShowAllTickets((prevState) => !prevState)
                      }
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
              }
              // role={user.profiles}
              // perform="tickets-manager:showall"
              // yes={() => (
                // <FormControlLabel
                //   label={i18n.t("tickets.buttons.showAll")}
                //   labelPlacement="start"
                //   control={
                //     <Switch
                //       size="small"
                //       checked={showAllTickets}
                //       onChange={() =>
                //         setShowAllTickets((prevState) => !prevState)
                //       }
                //       name="showAllTickets"
                //       color="primary"
                //     />
                //   }
                // />
              // )}
            />
            <TicketsQueueSelect
              style={{ marginLeft: 6 }}
              selectedQueueIds={selectedQueueIds}
              userQueues={user?.queues}
              onChange={(values) => setSelectedQueueIds(values)}
            />
          </>
        )}
        {tab === "closed" && (
          <div style={{ width: "100%" }}>
            <Can
              permission="tickets-manager:showall"
              item={
                <div 
                  style={{ 
                    textAlign: "center", 
                    width: "100%", 
                    marginBottom: "10px",
                  }}
                >
                  <FormControlLabel
                    label={i18n.t("tickets.buttons.showAll")}
                    labelPlacement="start"
                    control={
                      <Switch
                        size="small"
                        checked={showAllTickets}
                        onChange={() =>
                          setShowAllTickets((prevState) => !prevState)
                        }
                        name="showAllTickets"
                        color="primary"
                      />
                    }
                  />
                </div>
              }
              // role={user.profiles}
              // perform="tickets-manager:showall"
              // yes={() => (
              //   <div 
              //     style={{ 
              //       textAlign: "center", 
              //       width: "100%", 
              //       marginBottom: "10px",
              //     }}
              //   >
              //     <FormControlLabel
              //       label={i18n.t("tickets.buttons.showAll")}
              //       labelPlacement="start"
              //       control={
              //         <Switch
              //           size="small"
              //           checked={showAllTickets}
              //           onChange={() =>
              //             setShowAllTickets((prevState) => !prevState)
              //           }
              //           name="showAllTickets"
              //           color="primary"
              //         />
              //       }
              //     />
              //   </div>
              // )}
            />
            <div 
              style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px"
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setNewTicketModalOpen(true)}
              >
                {i18n.t("ticketsManager.buttons.newTicket")}
              </Button>
              <div style={{ width: 120, marginTop: -4 }}>
                <FormControl fullWidth margin="dense">
                  <Select
                    displayEmpty
                    variant="outlined"
                    value={categoryId}
                    onChange={handleCategoryChange}
                    MenuProps={{
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                      getContentAnchorEl: null,
                    }}
                    renderValue={() => "Categoria"}
                  >
                    {categories?.length > 0 &&
                      categories.map(category => (
                        <MenuItem dense key={category.id} value={category.id}>
                          <ListItemText primary={category.name} />
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>
              <TicketsQueueSelect
                style={{ marginLeft: 6 }}
                selectedQueueIds={selectedQueueIds}
                userQueues={user?.queues}
                onChange={(values) => setSelectedQueueIds(values)}
              />
            </div>
          </div>
        )}
      </Paper>
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <Badge
                overlap="rectangular"
                className={classes.badge}
                badgeContent={openCount}
                color="primary"
              >
                {i18n.t("ticketsList.assignedHeader")}
              </Badge>
            }
            value={"open"}
          />
          <Tab
            label={
              <Badge
                overlap="rectangular"
                className={classes.badge}
                badgeContent={pendingAnswerCount}
                color="primary"
              >
                {"Aguardando Resposta"}
              </Badge>
            }
            value={"pendingAnswer"}
          />
          <Tab
            label={
              <Badge
                overlap="rectangular"
                className={classes.badge}
                badgeContent={pendingCount}
                color="secondary"
              >
                {i18n.t("ticketsList.pendingHeader")}
              </Badge>
            }
            value={"pending"}
          />
        </Tabs>
        <Paper className={classes.ticketsWrapper}>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
          />
          <TicketsList
            status="open"
            pendingAnswer={true}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingAnswerCount(val)}
            style={applyPanelStyle("pendingAnswer")}
          />
          <TicketsList
            status="pending"
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
          />
        </Paper>
      </TabPanel>
      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
          categoryId={categoryId}
        />
      </TabPanel>
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        <TicketsList
          searchParam={searchParam}
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
    </Paper>
  );
};

export default TicketsManager;
