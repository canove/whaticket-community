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

    useEffect(() => {
        setLoading(true);

        const fetchTickets = async() => {
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
                updateTicketStatus(data.tickets);

                setHasMore(data.hasMore);
                setCount(data.count);
            } catch (err) {
                toastError(err);
            } finally {
                setLoading(false);
            }
        };

        const updateTicketStatus = (tickets) => {
            if (status === "open") {
                const automaticallyClosingHour = getHoursCloseTicketsAuto();

                if (automaticallyClosingHour && automaticallyClosingHour !== "" &&
                    automaticallyClosingHour !== "0" && Number(automaticallyClosingHour) > 0) {

                        const limitDate = new Date();
                        limitDate.setHours(limitDate.getHours() - Number(automaticallyClosingHour));

                        tickets.forEach(ticket => {
                            if (ticket.status !== "closed") {
                                const ticketLastInteractionDate = new Date(ticket.updatedAt);
                                if (ticketLastInteractionDate < limitDate) {
                                    closeTicket(ticket);
                                }
                            }
                        });
                }
            }
        };

        const closeTicket = async (ticket) => {
            try {
                await api.put(`/tickets/${ticket.id}`, {
                    status: "closed",
                    userId: ticket.userId || null,
                });
            } catch (err) {
                toastError(err);
            }
        };

        fetchTickets();

        const delayDebounceFn = setTimeout(() => {
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

    return { tickets, loading, hasMore, count };
};

export default useTickets;