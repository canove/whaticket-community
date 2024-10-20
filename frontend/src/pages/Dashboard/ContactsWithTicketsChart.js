import React, { useEffect, useState } from "react";
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

const ContactsWithTicketsChart = ({ startDate, endDate }) => {
  const theme = useTheme();
  const { contactsWithTicketsByDay } = useTickets({ startDate, endDate });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (contactsWithTicketsByDay) {
      setChartData(contactsWithTicketsByDay);
    }
  }, [contactsWithTicketsByDay]);

  return (
    <React.Fragment>
      <Title>{i18n.t("dashboard.contactsWithTickets.title")}</Title>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
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
          <XAxis dataKey="date" stroke={theme.palette.text.secondary}/>
            
          <YAxis stroke={theme.palette.text.secondary}>
            <Label
              angle={270}
              position="left"
              style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
            >
              {i18n.t("Contatos Únicos")}
            </Label>
          </YAxis>
          <Tooltip />
          <Bar dataKey="count" fill={theme.palette.primary.main} />
        </BarChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
};

export default ContactsWithTicketsChart;
