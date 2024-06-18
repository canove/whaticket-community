import React, { useContext, useEffect, useRef, useState } from "react";

import Badge from "@material-ui/core/Badge";
import InputBase from "@material-ui/core/InputBase";
import Paper from "@material-ui/core/Paper";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import { makeStyles } from "@material-ui/core/styles";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import SearchIcon from "@material-ui/icons/Search";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

import Menu from "@material-ui/core/Menu";
import { Can } from "../Can";

import TicketsWhatsappSelect from "../TicketsWhatsappSelect";

import MenuItem from "@material-ui/core/MenuItem";
import NewTicketModal from "../NewTicketModal";
import TabPanel from "../TabPanel";
import TicketsList from "../TicketsList";

import { Button } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import TicketsQueueSelect from "../TicketsQueueSelect";

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
    right: "-10px",
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

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const userQueueIds = [...user.queues.map((q) => q.id), null];
  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [selectedWhatsappIds, setSelectedWhatsappIds] = useState(null);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    localStorage.getItem("selectedWhatsappIds") &&
      setSelectedWhatsappIds(
        JSON.parse(localStorage.getItem("selectedWhatsappIds"))
      );

    localStorage.getItem("selectedQueueIds") &&
      setSelectedQueueIds(JSON.parse(localStorage.getItem("selectedQueueIds")));
  }, []);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // setSearchParam(searchedTerm);
      // setTab("open");
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

  return (
    <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(e) => setNewTicketModalOpen(false)}
      />

      {/* TABS */}
      <Paper elevation={0} square className={classes.tabsHeader}>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
        >
          {/* open */}
          <Tab
            value={"open"}
            icon={<MoveToInboxIcon />}
            label={i18n.t("tickets.tabs.open.title")}
            classes={{ root: classes.tab }}
          />
          {/* - open */}

          {/* closed */}
          <Tab
            value={"closed"}
            icon={<CheckBoxIcon />}
            label={i18n.t("tickets.tabs.closed.title")}
            classes={{ root: classes.tab }}
          />
          {/* - closed */}

          {/* search */}
          <Tab
            value={"search"}
            icon={<SearchIcon />}
            label={i18n.t("tickets.tabs.search.title")}
            classes={{ root: classes.tab }}
          />
          {/* - search */}
        </Tabs>
      </Paper>
      {/* - TABS */}

      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        {tab === "search" ? (
          <>
            {/* // SEARCH INPUT */}
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
            {/* - SEARCH INPUT */}
          </>
        ) : (
          <>
            {/* ADD TICKECT BUTTON */}
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setNewTicketModalOpen(true)}
            >
              {i18n.t("ticketsManager.buttons.newTicket")}
            </Button>
            {/* - ADD TICKECT BUTTON */}

            {/* SHOW ALL TICKETS SWITCH */}
            {/* <Can
              role={user.profile}
              perform="tickets-manager:showall"
              yes={() => (
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
              )}
            /> */}
            {/* - SHOW ALL TICKETS SWITCH */}
          </>
        )}

        {/* QUEUE SELECT */}
        <TicketsWhatsappSelect
          style={{ marginLeft: 6 }}
          selectedWhatsappIds={selectedWhatsappIds || []}
          userWhatsapps={whatsApps || []}
          onChange={(values) => setSelectedWhatsappIds(values)}
        />
        {/* - QUEUE SELECT */}

        {/* QUEUE SELECT */}
        <TicketsQueueSelect
          style={{ marginLeft: 6 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
        {/* - QUEUE SELECT */}
      </Paper>

      {/* open TAB CONTENT  */}
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        {/* TABS */}
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Badge
                  className={classes.badge}
                  badgeContent={openCount}
                  color="primary"
                  max={99999}
                >
                  {/* {i18n.t("ticketsList.assignedHeader")} */}
                  {showAllTickets ? "TODOS LOS CHATS" : "MIS CHATS"}
                </Badge>

                <Can
                  role={user.profile}
                  perform="tickets-manager:showall"
                  yes={() => (
                    <>
                      <ArrowDropDownIcon
                        fontSize="large"
                        onClick={handleClick}
                      />

                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                      >
                        <MenuItem
                          onClick={(e) => {
                            setShowAllTickets(true);
                            handleClose(e);
                          }}
                        >
                          TODOS LOS CHATS
                        </MenuItem>
                        <MenuItem
                          onClick={(e) => {
                            setShowAllTickets(false);
                            handleClose(e);
                          }}
                        >
                          MIS CHATS
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                />
              </div>
            }
            value={"open"}
          />
          <Tab
            label={
              <Badge
                className={classes.badge}
                badgeContent={pendingCount}
                color="secondary"
                max={99999}
              >
                {i18n.t("ticketsList.pendingHeader")}
              </Badge>
            }
            value={"pending"}
          />
        </Tabs>
        {/* - TABS */}

        {/* TABS CONTENT */}
        <Paper className={classes.ticketsWrapper}>
          {/*  */}
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedWhatsappIds={selectedWhatsappIds}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
          />
          <TicketsList
            status="pending"
            selectedWhatsappIds={selectedWhatsappIds}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
          />
        </Paper>
        {/* - TABS CONTENT */}
      </TabPanel>
      {/* - open TAB CONTENT  */}

      {/* closed TAB CONTENT */}
      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <TicketsList
          status="closed"
          showAll={true}
          selectedWhatsappIds={selectedWhatsappIds}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
      {/* - closed TAB CONTENT */}

      {/* search TAB CONTENT */}
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        <TicketsList
          searchParam={searchParam}
          showAll={true}
          selectedWhatsappIds={selectedWhatsappIds}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
      {/* - search TAB CONTENT */}
    </Paper>
  );
};

export default TicketsManager;
