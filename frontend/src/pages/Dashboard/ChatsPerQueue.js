import React, { useState, useEffect, useContext } from "react";
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
import { AuthContext } from "../../context/Auth/AuthContext";
import { TextField } from "@material-ui/core";

const ChartPerQueue = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const userQueueIds = user.queues.map(q => q.id) || [];
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());

  const { tickets } = useTickets({
    queueIds: JSON.stringify(userQueueIds),
    date: selectedDate,
  });

  const [queueChartData, setQueueChartData] = useState([]);

  useEffect(() => {
    const queueData = userQueueIds.map((queueId) => {
      const queue = user.queues.find((q) => q.id === queueId);
      const queueTickets = tickets.filter(ticket => Number(ticket.queueId) === Number(queueId));
  
      return {
        queueName: queue.name || `Queue ${queueId}`,
        count: queueTickets.length,
      };
    });
  
    setQueueChartData(queueData);
  }, [tickets, selectedDate]);
  
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

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
          <XAxis dataKey="queueName" stroke={theme.palette.text.secondary} />
          <YAxis stroke={theme.palette.text.secondary}>
            <Label
              angle={270}
              position="left"
              style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
            >
              Tickets
            </Label>
          </YAxis>
          <Tooltip />
          <Bar dataKey="count" fill={theme.palette.primary.main} />
        </BarChart>
      </ResponsiveContainer>
      <TextField
        label={i18n.t("dashboard.chartPerQueue.date.title")}
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

export default ChartPerQueue;
