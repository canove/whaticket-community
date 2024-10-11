import React, { useState, useEffect } from "react";
import { useTheme } from "@material-ui/core/styles";
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
import useAuth from "../../hooks/useAuth.js";
import Title from "./Title";

const ChartPerUser = ({ startDate, endDate }) => {
  const theme = useTheme();
  const { ticketsByUser } = useTickets({ startDate, endDate });
  const { user } = useAuth();
  const [userChartData, setUserChartData] = useState([]);

  useEffect(() => {
    // Verifica se há dados de tickets e formata para o gráfico
    if (ticketsByUser && Object.keys(ticketsByUser).length > 0) {
      const userData = Object.entries(ticketsByUser).map(([userId, count]) => {
        const userName = userId === user.id ? user.name : "Usuário desconhecido";
        return {
          userName,
          count,
        };
      });

      setUserChartData(userData);
    } else {
      setUserChartData([]); // Define como vazio caso não haja dados
    }
  }, [ticketsByUser, user]);

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
          <XAxis dataKey="userName" stroke={theme.palette.text.secondary}>
            <Label
              value={i18n.t("Usuários")}
              position="insideBottom"
              style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
            />
          </XAxis>
          <YAxis stroke={theme.palette.text.secondary}>
            <Label
              angle={270}
              position="left"
              style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
            >
              {i18n.t("Quantidade de Tickets")}
            </Label>
          </YAxis>
          <Tooltip />
          <Bar dataKey="count" fill={theme.palette.primary.main} />
        </BarChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
};

export default ChartPerUser;