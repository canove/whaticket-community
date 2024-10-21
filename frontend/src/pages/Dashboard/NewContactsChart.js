import React, { useEffect, useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import TextField from "@material-ui/core/TextField";
import { i18n } from "../../translate/i18n";
import useTickets from "../../hooks/useTickets";
import Title from "./Title";

const NewContactsChart = ({
  searchParam,
  pageNumber,
  status,
  date,
  showAll,
  queueIds,
  withUnreadMessages,
}) => {
  const theme = useTheme();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { newContactsByDay } = useTickets({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    queueIds,
    withUnreadMessages,
  });
 
  const [contactsChartData, setContactsChartData] = useState([]);

  // Função para gerar um intervalo de datas
  const generateDateRange = (start, end) => {
    const dateArray = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      dateArray.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  };

  // Função para obter os últimos 7 dias a partir de hoje
  const getLastWeekDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return { start, end };
  };

  useEffect(() => {
    if (!startDate && !endDate) {
      const { start, end } = getLastWeekDateRange();
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(end.toISOString().split("T")[0]);
    }
  }, []);

  useEffect(() => {
    if (newContactsByDay && Object.keys(newContactsByDay).length > 0 && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      const dateRange = generateDateRange(start, end);
  
      const formattedData = dateRange.map((date) => {
        const formattedDate = date.split("-").reverse().join("/");
        const contactCount = newContactsByDay[formattedDate] || 0;
  
        return {
          date: formattedDate,
          count: contactCount,
        };
      });
  
      setContactsChartData(formattedData);
    } else {
      setContactsChartData([]);
    }
  }, [newContactsByDay, startDate, endDate]);
  

  return (
    <React.Fragment>
      <Title>{i18n.t("dashboard.newContacts.title")}</Title>
      
      <ResponsiveContainer>
        <LineChart
          data={contactsChartData}
          margin={{ top: 16, right: 16, bottom: 0, left: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
          <YAxis stroke={theme.palette.text.secondary}>
            <Label
              angle={270}
              position="left"
              style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
            >
              {i18n.t("Contatos")}
            </Label>
          </YAxis>
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke={theme.palette.primary.main}
          />
        </LineChart>
      </ResponsiveContainer>

      <div
        style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}
      >
        <TextField
          label="Data de Início"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Data de Fim"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>
    </React.Fragment>
  );
};

export default NewContactsChart;
