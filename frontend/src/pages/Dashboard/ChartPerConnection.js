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
import TextField from '@material-ui/core/TextField'; // Importação do TextField

import { i18n } from "../../translate/i18n";
import useTickets from "../../hooks/useTickets";
import Title from "./Title";

const ChartPerConnection = ({ searchParam, pageNumber, status, date, showAll, queueIds, withUnreadMessages }) => {
  const theme = useTheme();

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getCurrentDate()); // Chamada da função para obter a data atual
  const { ticketsByConnection, formatDateToDDMMYYYY } = useTickets({ searchParam, pageNumber, status, date, showAll, queueIds, withUnreadMessages });
  const [connectionChartData, setConnectionChartData] = useState([]);

  useEffect(() => {
    if (ticketsByConnection && Object.keys(ticketsByConnection).length > 0) {
      const totalConnectionData = Object.entries(ticketsByConnection).map(([connectionName, dateCounts]) => {
        const totalCount = Object.values(dateCounts).reduce((acc, count) => acc + count, 0); 
        return { connectionName, count: totalCount };
      });
  
      if (selectedDate === getCurrentDate()) {
        setConnectionChartData(totalConnectionData);
      } else {
        const filteredData = Object.entries(ticketsByConnection).map(([connectionName, dateCounts]) => {
          const formattedDate = formatDateToDDMMYYYY(selectedDate);
          const count = dateCounts[formattedDate] || 0;
          return { connectionName, count };
        });
        
      
  
        setConnectionChartData(filteredData);
      }
    } else {
      setConnectionChartData([]);
    }
  }, [ticketsByConnection, selectedDate]);
  

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

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
          <XAxis dataKey="connectionName" stroke={theme.palette.text.secondary} />
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
        label={i18n.t("dashboard.chartPerConnection.date.title")}
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

export default ChartPerConnection;
