import React, { useState, useEffect } from "react";
import { useTheme, TextField } from "@material-ui/core";
import {
  BarChart,
  CartesianGrid,
  Bar,
  XAxis,
  YAxis,
  Label,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { i18n } from "../../translate/i18n";
import useTickets from "../../hooks/useTickets";
import Title from "./Title";
import api from "../../services/api";

const ChartPerUser = ({ searchParam, pageNumber, status, date, showAll, queueIds, withUnreadMessages }) => {
  const theme = useTheme();
  const { ticketsByUser } = useTickets({ searchParam, pageNumber, status, date, showAll, queueIds, withUnreadMessages });
  const [userChartData, setUserChartData] = useState([]);
  const [users, setUsers] = useState({});
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const [selectedDate, setSelectedDate] = useState(getCurrentDate);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users");
        const usersMap = data.users.reduce((acc, user) => {
          acc[String(user.id)] = user.name;
          return acc;
        }, {});
        setUsers(usersMap);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (
      ticketsByUser && 
      Object.keys(ticketsByUser).length > 0 && 
      Object.keys(users).length > 0
    ) {
      const userData = Object.entries(ticketsByUser)
        .map(([userId, dates]) => {
          const userName = users[String(userId)] || (userId === 'null' ? "Administrador" : "Usuário desconhecido");
          const count = dates[selectedDate] || 0;
          return {
            userName,
            count,
          };
        });
  
      setUserChartData(userData);
    } else {
      setUserChartData([]);
    }
  }, [ticketsByUser, users, selectedDate]);
  

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <React.Fragment>
      <Title>{i18n.t("dashboard.chartPerUser.perUser.title")}</Title>
      <ResponsiveContainer>
        <BarChart
          data={userChartData}
          barSize={40}
          width={730}
          height={250}
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 24,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="userName" stroke={theme.palette.text.secondary} />
          <YAxis stroke={theme.palette.text.secondary}>
            <Label
              angle={270}
              position="left"
              style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
            >
              {i18n.t("Tickets")}
            </Label>
          </YAxis>
          <Tooltip />
          <Bar dataKey="count" fill={theme.palette.primary.main} />
        </BarChart>
      </ResponsiveContainer>
      <TextField
        label={i18n.t("dashboard.chartPerUser.date.title")}
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        InputLabelProps={{
          shrink: true,
        }}
        style={{ marginBottom: "16px" }}
      />
    </React.Fragment>
  );
};

export default ChartPerUser;
