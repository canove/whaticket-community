import React, { useContext, useState, useEffect } from "react";
import makeStyles from '@mui/styles/makeStyles';

import useTickets from "../../hooks/useTickets";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import Chart from "./Chart";
import api from "../../services/api";

import { MessageSquareText, Hourglass, CheckCircle2 } from "lucide-react";
import Avatar from "@mui/material/Avatar";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "24px 24px",
    backgroundColor: "#FAFAF9",
    minHeight: "100%",
    ...theme.scrollbarStyles,
  },

  greeting: {
    marginBottom: 24,
  },

  greetingTitle: {
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 24,
    color: "#1C1917",
    letterSpacing: "-0.4px",
    margin: "0 0 4px",
  },

  greetingSubtitle: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
    color: "#78716C",
    fontWeight: 400,
    margin: 0,
  },

  statsRow: {
    display: "flex",
    gap: 14,
    marginBottom: 20,
    flexWrap: "wrap",
    [theme.breakpoints.down('md')]: {
      flexDirection: "column",
    },
  },

  statCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: "#ffffff",
    border: "1px solid #E7E5E4",
    borderRadius: 14,
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    position: "relative",
    overflow: "hidden",
    transition: "box-shadow 0.2s ease, transform 0.2s ease",
    "&:hover": {
      boxShadow: "0 4px 16px rgba(28,25,23,0.08)",
      transform: "translateY(-1px)",
    },
  },

  statCardTopAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: "14px 14px 0 0",
  },

  statCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statLabel: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 11.5,
    fontWeight: 600,
    color: "#78716C",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    margin: 0,
  },

  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 17,
    },
  },

  statValue: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 40,
    fontWeight: 700,
    color: "#1C1917",
    letterSpacing: "-2px",
    lineHeight: 1,
    margin: 0,
  },

  statDescription: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12,
    color: "#A8A29E",
    margin: 0,
  },

  chartCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #E7E5E4",
    borderRadius: 14,
    padding: "20px 20px",
    height: 300,
    marginBottom: 20,
  },

  rankingCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #E7E5E4",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 24,
  },

  rankingHeader: {
    padding: "14px 20px",
    borderBottom: "1px solid #F0EFED",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rankingTitle: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 14,
    color: "#1C1917",
    letterSpacing: "-0.1px",
    margin: 0,
  },

  rankingDate: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12,
    color: "#A8A29E",
    margin: 0,
    textTransform: "capitalize",
  },

  rankingTable: {
    width: "100%",
    borderCollapse: "collapse",
  },

  rankingTh: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 11,
    color: "#A8A29E",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    padding: "10px 20px",
    textAlign: "left",
    backgroundColor: "#FAFAF9",
    borderBottom: "1px solid #E7E5E4",
  },

  rankingThRight: {
    textAlign: "right",
  },

  rankingRow: {
    borderBottom: "1px solid #F5F5F4",
    transition: "background 0.12s ease",
    "&:last-child": {
      borderBottom: "none",
    },
    "&:hover": {
      backgroundColor: "#FAFAF9",
    },
  },

  rankingTd: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
    color: "#292524",
    padding: "10px 20px",
    verticalAlign: "middle",
  },

  rankingTdRight: {
    textAlign: "right",
  },

  rankingPosition: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 13,
    color: "#A8A29E",
    width: 28,
  },

  positionFirst: {
    color: "#F59E0B",
  },

  userCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  userAvatar: {
    width: 30,
    height: 30,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: '"DM Sans", system-ui, sans-serif',
  },

  userName: {
    fontWeight: 600,
    color: "#292524",
    fontSize: 14,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 28,
    height: 22,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    padding: "0 7px",
  },

  badgeGreen: {
    backgroundColor: "rgba(37,211,102,0.1)",
    color: "#16A34A",
  },

  badgeAmber: {
    backgroundColor: "rgba(245,158,11,0.1)",
    color: "#B45309",
  },

  badgeIndigo: {
    backgroundColor: "rgba(99,102,241,0.1)",
    color: "#4338CA",
  },

  totalValue: {
    fontWeight: 700,
    fontSize: 14,
    color: "#1C1917",
  },

  emptyRanking: {
    padding: "36px 20px",
    textAlign: "center",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
    color: "#A8A29E",
  },
}));

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getAvatarColor = (name = "") => {
  const colors = [
    { bg: "#DCFCE7", text: "#15803D" },
    { bg: "#EDE9FE", text: "#6D28D9" },
    { bg: "#FEF3C7", text: "#B45309" },
    { bg: "#FCE7F3", text: "#9D174D" },
    { bg: "#DBEAFE", text: "#1D4ED8" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
};

const cardConfigs = [
  {
    color: "#16A34A",
    bgColor: "rgba(22,163,74,0.1)",
    barColor: "#25D366",
    Icon: MessageSquareText,
    description: "tickets em atendimento",
  },
  {
    color: "#B45309",
    bgColor: "rgba(245,158,11,0.1)",
    barColor: "#F59E0B",
    Icon: Hourglass,
    description: "aguardando atendente",
  },
  {
    color: "#4338CA",
    bgColor: "rgba(99,102,241,0.1)",
    barColor: "#6366F1",
    Icon: CheckCircle2,
    description: "resolvidos hoje",
  },
];

const StatCard = ({ label, value, config }) => {
  const classes = useStyles();
  const { color, bgColor, barColor, Icon, description } = config;
  return (
    <div className={classes.statCard}>
      <div className={classes.statCardTopAccent} style={{ backgroundColor: barColor }} />
      <div className={classes.statCardHeader}>
        <p className={classes.statLabel}>{label}</p>
        <div className={classes.statIconWrap} style={{ backgroundColor: bgColor }}>
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <p className={classes.statValue}>{value}</p>
      <p className={classes.statDescription}>{description}</p>
    </div>
  );
};

const Dashboard = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [userStats, setUserStats] = useState([]);

  const userQueueIds =
    user.queues && user.queues.length > 0 ? user.queues.map((q) => q.id) : [];

  const GetTickets = (status, showAll, withUnreadMessages) => {
    const { count } = useTickets({
      status,
      showAll,
      withUnreadMessages,
      queueIds: JSON.stringify(userQueueIds),
      date: status === "closed" ? new Date().toISOString().split("T")[0] : undefined,
    });
    return count;
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const { data } = await api.get("/tickets/count-by-user");
        setUserStats(data);
      } catch (err) {
        // silently fail — stats are non-critical
      }
    };
    fetchUserStats();

    const interval = setInterval(fetchUserStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const firstName = user?.name?.split(" ")[0] || user?.name || "";

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className={classes.root}>
      <div className={classes.greeting}>
        <p className={classes.greetingTitle}>Olá, {firstName} 👋</p>
        <p className={classes.greetingSubtitle}>
          Aqui está o resumo do seu dia
        </p>
      </div>

      <div className={classes.statsRow}>
        <StatCard
          label={i18n.t("dashboard.messages.inAttendance.title")}
          value={GetTickets("open", "true", "false")}
          config={cardConfigs[0]}
        />
        <StatCard
          label={i18n.t("dashboard.messages.waiting.title")}
          value={GetTickets("pending", "true", "false")}
          config={cardConfigs[1]}
        />
        <StatCard
          label={i18n.t("dashboard.messages.closed.title")}
          value={GetTickets("closed", "true", "false")}
          config={cardConfigs[2]}
        />
      </div>

      <div className={classes.chartCard}>
        <Chart />
      </div>

      <div className={classes.rankingCard}>
        <div className={classes.rankingHeader}>
          <p className={classes.rankingTitle}>Atendimentos por Usuário Hoje</p>
          <p className={classes.rankingDate}>{today}</p>
        </div>
        {userStats.length === 0 ? (
          <div className={classes.emptyRanking}>
            Nenhum atendimento registrado hoje
          </div>
        ) : (
          <table className={classes.rankingTable}>
            <thead>
              <tr>
                <th className={classes.rankingTh} style={{ width: 48 }}>#</th>
                <th className={classes.rankingTh}>Atendente</th>
                <th className={`${classes.rankingTh} ${classes.rankingThRight}`}>Em aberto</th>
                <th className={`${classes.rankingTh} ${classes.rankingThRight}`}>Aguardando</th>
                <th className={`${classes.rankingTh} ${classes.rankingThRight}`}>Encerrados</th>
                <th className={`${classes.rankingTh} ${classes.rankingThRight}`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {userStats.map((stat, index) => {
                const avatarColors = getAvatarColor(stat.userName);
                return (
                  <tr key={stat.userId} className={classes.rankingRow}>
                    <td className={classes.rankingTd}>
                      <span
                        className={`${classes.rankingPosition} ${
                          index === 0 ? classes.positionFirst : ""
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className={classes.rankingTd}>
                      <div className={classes.userCell}>
                        <Avatar
                          className={classes.userAvatar}
                          style={{
                            backgroundColor: avatarColors.bg,
                            color: avatarColors.text,
                          }}
                        >
                          {getInitials(stat.userName)}
                        </Avatar>
                        <span className={classes.userName}>{stat.userName}</span>
                      </div>
                    </td>
                    <td className={`${classes.rankingTd} ${classes.rankingTdRight}`}>
                      <span className={`${classes.badge} ${classes.badgeGreen}`}>
                        {stat.open}
                      </span>
                    </td>
                    <td className={`${classes.rankingTd} ${classes.rankingTdRight}`}>
                      <span className={`${classes.badge} ${classes.badgeAmber}`}>
                        {stat.pending}
                      </span>
                    </td>
                    <td className={`${classes.rankingTd} ${classes.rankingTdRight}`}>
                      <span className={`${classes.badge} ${classes.badgeIndigo}`}>
                        {stat.closed}
                      </span>
                    </td>
                    <td className={`${classes.rankingTd} ${classes.rankingTdRight}`}>
                      <span className={classes.totalValue}>{stat.total}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
