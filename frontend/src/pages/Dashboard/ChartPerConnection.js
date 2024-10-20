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
import Title from "./Title";

const ChartPerConnection = ({ startDate, endDate }) => {
  const theme = useTheme();
  const { ticketsByConnection } = useTickets({ startDate, endDate });
  const [connectionChartData, setConnectionChartData] = useState([]);

  useEffect(() => {
    if (ticketsByConnection && Object.keys(ticketsByConnection).length > 0) {
      const connectionData = Object.entries(ticketsByConnection).map(([connectionName, count]) => ({
        connectionName,
        count,
      }));

      setConnectionChartData(connectionData);
    } else {
      setConnectionChartData([]);
    }
  }, [ticketsByConnection]);

  return (
    <React.Fragment>
      <Title>{i18n.t("dashboard.chartPerConnection.perConnection.title")}</Title>
      <ResponsiveContainer>
        <BarChart
          data={connectionChartData}
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
          <XAxis dataKey="connectionName" stroke={theme.palette.text.secondary}/>
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

export default ChartPerConnection;
