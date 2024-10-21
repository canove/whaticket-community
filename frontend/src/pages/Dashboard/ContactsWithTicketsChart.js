import React, { useEffect, useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import useTickets from "../../hooks/useTickets";
import Title from "./Title";
import { TextField } from "@material-ui/core";

const ContactsWithTicketsChart = () => {
  const theme = useTheme();

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const { contactsWithTicketsByDay } = useTickets({ date: selectedDate });

  const [contactsForSelectedDate, setContactsForSelectedDate] = useState([]);

  useEffect(() => {
    if (contactsWithTicketsByDay && contactsWithTicketsByDay.length > 0) {
        const formattedSelectedDate = selectedDate.split("-").reverse().join("/");
        
        // Encontrar os contatos correspondentes à data formatada
        const contactsData = contactsWithTicketsByDay.find(item => item.date === formattedSelectedDate);

        if (contactsData) {
            setContactsForSelectedDate(contactsData.contacts);
        } else {
            setContactsForSelectedDate([]);
        }
    } else {
        setContactsForSelectedDate([]);
    }
  }, [contactsWithTicketsByDay, selectedDate]);
  console.log(contactsForSelectedDate, 'contatos aaaa');

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <React.Fragment>
      <Title>{`${i18n.t("dashboard.contactsWithTickets.title")} ${
				 contactsForSelectedDate.length
			}`}</Title>
      <TableContainer style={{ marginTop: "16px", border: `1px solid ${theme.palette.divider}` }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="h6">{i18n.t("dashboard.contactsWithTickets.contactList.title")}</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contactsForSelectedDate.length > 0 ? (
              contactsForSelectedDate.map((contact, index) => (
                <TableRow key={index}>
                  <TableCell>{contact}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell>{i18n.t("dashboard.contactsWithTickets.message")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TextField
        label={i18n.t("dashboard.contactsWithTickets.date.title")}
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

export default ContactsWithTicketsChart;
