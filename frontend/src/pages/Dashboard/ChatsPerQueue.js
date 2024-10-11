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

const ChartPerQueue = ({ startDate, endDate }) => {
  const theme = useTheme();
  const { ticketsByQueue } = useTickets({ startDate, endDate });
  const [queueChartData, setQueueChartData] = useState([]);

  useEffect(() => {
    if (ticketsByQueue && Object.keys(ticketsByQueue).length > 0) {
      const queueData = Object.entries(ticketsByQueue).map(([queueName, count]) => ({
        queueName,
        count,
      }));
      setQueueChartData(queueData);
    } else {
      setQueueChartData([]);
    }
  }, [ticketsByQueue]);

  return (
    <React.Fragment>
      <Title>{i18n.t("dashboard.chartPerQueue.perQueue.title")}</Title>
      <ResponsiveContainer>
        <BarChart
          data={queueChartData}
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
          <XAxis dataKey="queueName" stroke={theme.palette.text.secondary}>
            <Label
              value={i18n.t("Filas")}
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

export default ChartPerQueue;
