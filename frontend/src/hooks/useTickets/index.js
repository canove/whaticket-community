import { useState, useEffect } from "react";
import { getHoursCloseTicketsAuto } from "../../config";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useTickets = ({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    queueIds,
    withUnreadMessages,
   
}) => {
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [count, setCount] = useState(0);
    const [ticketsByUser, setTicketsByUser] = useState({});
    const [ticketsByConnection, setTicketsByConnection] = useState({});
    const [ticketsByQueue, setTicketsByQueue] = useState({});
    const [newContactsByDay, setNewContactsByDay] = useState({});
    const [contactsWithTicketsByDay, setContactsWithTicketsByDay] = useState({});

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchTickets = async () => {
                try {
                    const { data } = await api.get("/tickets", {
                        params: {
                            searchParam,
                            pageNumber,
                            status,
                            date,
                            showAll,
                            queueIds,
                            withUnreadMessages,
                    
                           
                        },
                    });
                    
                    setTickets(data.tickets);
                    console.log("data do usetickets:", data.tickets);
                     // Contagem de contatos que criaram tickets por dia
                     const contactsByDay = data.tickets.reduce((acc, ticket) => {
                        const contactName = ticket.contact?.name || "Contato desconhecido";
                        const createdAtDate = new Date(ticket.createdAt).toLocaleDateString();

                        if (!acc[createdAtDate]) {
                            acc[createdAtDate] = new Set();
                        }
                        acc[createdAtDate].add(contactName);

                        return acc;
                    }, {});

                    const contactsWithTicketsByDay = Object.entries(contactsByDay).map(
                        ([date, contacts]) => ({
                            date,
                            count: contacts.size,
                        })
                    );

                    setContactsWithTicketsByDay(contactsWithTicketsByDay);

                     // Lógica para calcular os contatos novos por dia
                   const contactsPerDay = data.tickets.reduce((acc, ticket) => {
                        const createdDate = new Date(ticket.createdAt).toLocaleDateString();
                        acc[createdDate] = acc[createdDate] ? acc[createdDate] + 1 : 1;
                        return acc;
                    }, {});
                    setNewContactsByDay(contactsPerDay);
                   
                    // Contagem de tickets por fila
                    const ticketsCountByQueue = data.tickets.reduce((acc, ticket) => {
                        const queueName = ticket.queue?.name || "Fila desconhecida";
                        acc[queueName] = acc[queueName] ? acc[queueName] + 1 : 1;
                        return acc;
                    }, {});
                    setTicketsByQueue(ticketsCountByQueue);


                    // Contagem de tickets por conexão
                    const ticketsCountByConnection = data.tickets.reduce((acc, ticket) => {
                        const connectionName = ticket.whatsapp?.name || "Conexão desconhecida";
                        acc[connectionName] = acc[connectionName] ? acc[connectionName] + 1 : 1;
                        return acc;
                    }, {});
                    setTicketsByConnection(ticketsCountByConnection);

                    // Contagem de tickets por usuário usando o id
                    const ticketsCountByUser = data.tickets.reduce((acc, ticket) => {
                        const userID = ticket.userId;
                        const createdDate = new Date(ticket.createdAt).toISOString().split("T")[0];
                        
                        if (!acc[userID]) {
                          acc[userID] = {};
                        }
                      
                        acc[userID][createdDate] = acc[userID][createdDate] ? acc[userID][createdDate] + 1 : 1;
                        
                        return acc;
                      }, {});
                      
                      setTicketsByUser(ticketsCountByUser);
                    
                    // Fechamento automático de tickets
                    let horasFecharAutomaticamente = getHoursCloseTicketsAuto();
                    if (
                        status === "open" &&
                        horasFecharAutomaticamente &&
                        horasFecharAutomaticamente !== "" &&
                        horasFecharAutomaticamente !== "0" &&
                        Number(horasFecharAutomaticamente) > 0
                    ) {
                        let dataLimite = new Date();
                        dataLimite.setHours(dataLimite.getHours() - Number(horasFecharAutomaticamente));

                        data.tickets.forEach(ticket => {
                            if (ticket.status !== "closed") {
                                let dataUltimaInteracaoChamado = new Date(ticket.updatedAt);
                                if (dataUltimaInteracaoChamado < dataLimite)
                                    closeTicket(ticket);
                            }
                        });
                    }

                    setHasMore(data.hasMore);
                    setCount(data.count);
                    setLoading(false);
                } catch (err) {
                    setLoading(false);
                    toastError(err);
                }
            };

            const closeTicket = async (ticket) => {
                await api.put(`/tickets/${ticket.id}`, {
                    status: "closed",
                    userId: ticket.userId || null,
                });
            };

            fetchTickets();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [
        searchParam,
        pageNumber,
        status,
        date,
        showAll,
        queueIds,
        withUnreadMessages,
    ]);

    return {
        tickets,
        loading,
        hasMore,
        count,
        ticketsByUser,
        ticketsByConnection,
        ticketsByQueue,
        newContactsByDay,
        contactsWithTicketsByDay,
    };
};

export default useTickets;
