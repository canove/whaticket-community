import React, { useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { Button } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  },
  tabsHeader: {
    flex: "none",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1, 1, 0.5, 1),
  },
  subTabsHeader: {
    flex: "none",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.5, 1, 1, 1),
  },
  segment: {
    minHeight: 38,
    backgroundColor: theme.palette.background.default,
    borderRadius: 10,
    padding: 4,
  },
  segmentTab: {
    minHeight: 30,
    minWidth: 0,
    borderRadius: 8,
    textTransform: "none",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: theme.palette.text.secondary,
    "&.Mui-selected": {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.primary.main,
      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
    },
  },
  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: 8,
  },
  mainTabs: {
    minHeight: 44,
  },
  tab: {
    minWidth: 0,
    minHeight: 44,
    padding: "4px 8px",
    textTransform: "none",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  tabLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  subTabs: {
    minHeight: 40,
  },
  subTab: {
    minHeight: 40,
    textTransform: "none",
    fontSize: "0.82rem",
    fontWeight: 600,
  },
  segmentTabLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  countPill: {
    minWidth: 20,
    height: 18,
    padding: "0 6px",
    borderRadius: 999,
    fontSize: "0.68rem",
    fontWeight: 700,
    lineHeight: "18px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  countPillOpen: {
    backgroundColor: theme.palette.primary.main,
  },
  countPillPending: {
    backgroundColor: theme.palette.secondary.main,
  },
  optionsGroup: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  showAllLabel: {
    marginLeft: 0,
    marginRight: 0,
  },
  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: theme.palette.background.paper,
    padding: theme.spacing(0.75, 1),
  },
  serachInputWrapper: {
    flex: 1,
    background: theme.palette.background.default,
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
    color: theme.palette.text.primary, 
    backgroundColor: theme.palette.background.default,
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
  const [showAllTickets, setShowAllTickets] = useState(true);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

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
          className={classes.segment}
          TabIndicatorProps={{ style: { display: "none" } }}
          aria-label="ticket views"
        >
          <Tab
            value={"open"}
            classes={{ root: classes.segmentTab }}
            label={
              <span className={classes.tabLabel}>
                <MoveToInboxIcon fontSize="small" />
                {i18n.t("tickets.tabs.open.title")}
              </span>
            }
          />
          <Tab
            value={"closed"}
            classes={{ root: classes.segmentTab }}
            label={
              <span className={classes.tabLabel}>
                <CheckBoxIcon fontSize="small" />
                {i18n.t("tickets.tabs.closed.title")}
              </span>
            }
          />
          <Tab
            value={"search"}
            classes={{ root: classes.segmentTab }}
            label={
              <span className={classes.tabLabel}>
                <SearchIcon fontSize="small" />
                {i18n.t("tickets.tabs.search.title")}
              </span>
            }
          />
        </Tabs>
      </Paper>
      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        {tab === "search" ? (
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
              selectedQueueIds={selectedQueueIds}
              userQueues={user?.queues}
              onChange={(values) => setSelectedQueueIds(values)}
            />
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setNewTicketModalOpen(true)}
            >
              {i18n.t("ticketsManager.buttons.newTicket")}
            </Button>
            <div className={classes.optionsGroup}>
              <FormControlLabel
                className={classes.showAllLabel}
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
              <TicketsQueueSelect
                selectedQueueIds={selectedQueueIds}
                userQueues={user?.queues}
                onChange={(values) => setSelectedQueueIds(values)}
              />
            </div>
          </>
        )}
      </Paper>
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        <div className={classes.subTabsHeader}>
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          variant="fullWidth"
          className={classes.segment}
          TabIndicatorProps={{ style: { display: "none" } }}
        >
          <Tab
            classes={{ root: classes.segmentTab }}
            label={
              <span className={classes.segmentTabLabel}>
                {i18n.t("ticketsList.assignedHeader")}
                {openCount > 0 && (
                  <span
                    className={clsx(classes.countPill, classes.countPillOpen)}
                  >
                    {openCount}
                  </span>
                )}
              </span>
            }
            value={"open"}
          />
          <Tab
            classes={{ root: classes.segmentTab }}
            label={
              <span className={classes.segmentTabLabel}>
                {i18n.t("ticketsList.pendingHeader")}
                {pendingCount > 0 && (
                  <span
                    className={clsx(classes.countPill, classes.countPillPending)}
                  >
                    {pendingCount}
                  </span>
                )}
              </span>
            }
            value={"pending"}
          />
        </Tabs>
        </div>
        <Paper className={classes.ticketsWrapper}>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
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
