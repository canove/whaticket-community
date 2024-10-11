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
import { i18n } from "../../translate/i18n";
import useTickets from "../../hooks/useTickets";
import Title from "./Title";

const NewContactsChart = ({ startDate, endDate }) => {
  const theme = useTheme();
  const { newContactsByDay } = useTickets({ startDate, endDate });
  const [contactsChartData, setContactsChartData] = useState([]);

  useEffect(() => {
    if (newContactsByDay && Object.keys(newContactsByDay).length > 0) {
      const formattedData = Object.entries(newContactsByDay).map(([date, count]) => ({
        date,
        count,
      }));
      setContactsChartData(formattedData);
    } else {
      setContactsChartData([]);
    }
  }, [newContactsByDay]);

  return (
    <React.Fragment>
      <Title>{i18n.t("dashboard.newContacts.title")}</Title>
      <ResponsiveContainer>
        <LineChart
          data={contactsChartData}
          margin={{ top: 16, right: 16, bottom: 0, left: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke={theme.palette.text.secondary}>
            <Label
              value={i18n.t("Data")}
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
              {i18n.t("Quantidade de Contatos")}
            </Label>
          </YAxis>
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke={theme.palette.primary.main} />
        </LineChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
};

export default NewContactsChart;
