import React, { useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { alpha, makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Chip from "@material-ui/core/Chip";
import Fab from "@material-ui/core/Fab";
import Tooltip from "@material-ui/core/Tooltip";
import AddIcon from "@material-ui/icons/Add";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  tabsHeader: {
    flex: "none",
    padding: theme.spacing(1.5, 1.5, 0.5),
    backgroundColor: theme.palette.background.paper,
  },
  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: 8,
  },
  tabs: {
    minHeight: 0,
  },
  tabsFlexContainer: {
    gap: theme.spacing(0.5),
  },
  tabsIndicator: {
    display: "none",
  },
  tab: {
    ...theme.typography.subtitle2,
    minWidth: 0,
    minHeight: 0,
    padding: theme.spacing(1.25),
    borderRadius: theme.borderRadius.small,
    textTransform: "none",
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: alpha(theme.palette.text.primary, 0.04),
    },
  },
  tabSelected: {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    },
  },
  tabWrapper: {
    flexDirection: "row",
    gap: theme.spacing(1),
  },
  tabLabelIcon: {
    minHeight: 0,
    paddingTop: theme.spacing(1.25),
    "& $tabWrapper > *:first-child": {
      marginBottom: 0,
    },
  },
  ticketOptionsBox: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: theme.spacing(1),
    background: theme.palette.background.paper,
    padding: theme.spacing(0.5, 1.5),
  },
  serachInputWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.palette.action.selected,
  },
  searchIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  searchInput: {
    flex: 1,
    color: theme.palette.text.primary,
  },
  statusChips: {
    flex: "none",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1, 1),
  },
  statusChip: {
    backgroundColor: theme.palette.action.selected,
  },
  statusChipSelected: {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
    "&:hover, &:focus": {
      backgroundColor: theme.palette.info.main,
    },
  },
  statusChipLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
  },
  statusChipCount: {
    padding: theme.spacing(0, 0.75),
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    fontSize: "0.6875rem",
    fontWeight: 600,
    lineHeight: "16px",
  },
  newTicketButton: {
    position: "absolute",
    left: theme.spacing(2),
    bottom: theme.spacing(2),
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
  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

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

  const tabClasses = {
    root: classes.tab,
    selected: classes.tabSelected,
    wrapper: classes.tabWrapper,
    labelIcon: classes.tabLabelIcon,
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
          variant="scrollable"
          scrollButtons="off"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
          classes={{
            root: classes.tabs,
            flexContainer: classes.tabsFlexContainer,
            indicator: classes.tabsIndicator,
          }}
        >
          <Tab
            value={"open"}
            icon={<MoveToInboxIcon fontSize="small" />}
            label={i18n.t("tickets.tabs.open.title")}
            classes={tabClasses}
          />
          <Tab
            value={"closed"}
            icon={<CheckBoxIcon fontSize="small" />}
            label={i18n.t("tickets.tabs.closed.title")}
            classes={tabClasses}
          />
          <Tab
            value={"search"}
            icon={<SearchIcon fontSize="small" />}
            label={i18n.t("tickets.tabs.search.title")}
            classes={tabClasses}
          />
        </Tabs>
      </Paper>
      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        {tab === "search" ? (
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
        ) : (
          <Can
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
          />
        )}
        <TicketsQueueSelect
          style={{ marginLeft: 6 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
      </Paper>
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        <div className={classes.statusChips}>
          <Chip
            clickable
            onClick={(e) => handleChangeTabOpen(e, "open")}
            className={clsx(
              classes.statusChip,
              tabOpen === "open" && classes.statusChipSelected
            )}
            label={
              <span className={classes.statusChipLabel}>
                {i18n.t("ticketsList.assignedHeader")}
                {openCount > 0 && (
                  <span className={classes.statusChipCount}>
                    {openCount > 99 ? "99+" : openCount}
                  </span>
                )}
              </span>
            }
          />
          <Chip
            clickable
            onClick={(e) => handleChangeTabOpen(e, "pending")}
            className={clsx(
              classes.statusChip,
              tabOpen === "pending" && classes.statusChipSelected
            )}
            label={
              <span className={classes.statusChipLabel}>
                {i18n.t("ticketsList.pendingHeader")}
                {pendingCount > 0 && (
                  <span className={classes.statusChipCount}>
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </span>
            }
          />
        </div>
        <Paper elevation={0} square className={classes.ticketsWrapper}>
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
      {tab !== "search" && (
        <Tooltip title={i18n.t("ticketsManager.buttons.newTicket")}>
          <Fab
            color="primary"
            size="medium"
            aria-label={i18n.t("ticketsManager.buttons.newTicket")}
            className={classes.newTicketButton}
            onClick={() => setNewTicketModalOpen(true)}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}
    </Paper>
  );
};

export default TicketsManager;
