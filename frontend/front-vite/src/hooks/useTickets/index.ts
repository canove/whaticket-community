import { useState, useEffect } from "react";
import { getHoursCloseTicketsAuto } from "../../config";
import toastError from "../../errors/toastError";
import type { Error } from "../../types/Error";

import api from "../../services/api";

interface UseTicketsParams {
  searchParam?: string;
  pageNumber?: number;
  status?: string;
  date?: string;
  showAll?: boolean | string;
  queueIds?: number[] | string;
  withUnreadMessages?: string;
}

const useTickets = ({
  searchParam,
  pageNumber,
  status,
  date,
  showAll,
  queueIds,
  withUnreadMessages,
}: UseTicketsParams) => {
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [tickets, setTickets] = useState([] as any[]);
  const [count, setCount] = useState(0);

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

          let horasFecharAutomaticamente = getHoursCloseTicketsAuto();

          if (
            status === "open" &&
            horasFecharAutomaticamente &&
            horasFecharAutomaticamente !== "" &&
            horasFecharAutomaticamente !== "0" &&
            Number(horasFecharAutomaticamente) > 0
          ) {
            let dataLimite = new Date();
            dataLimite.setHours(
              dataLimite.getHours() - Number(horasFecharAutomaticamente)
            );

            data.tickets.forEach(
              (ticket: {
                id: number;
                status: string;
                updatedAt: string;
                userId?: number;
              }) => {
                if (ticket.status !== "closed") {
                  let dataUltimaInteracaoChamado = new Date(ticket.updatedAt);
                  if (dataUltimaInteracaoChamado < dataLimite)
                    closeTicket(ticket);
                }
              }
            );
          }

          setHasMore(data.hasMore);
          setCount(data.count);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err as Error);
        }
      };

      const closeTicket = async (ticket: {
        id: number;
        status: string;
        updatedAt: string;
        userId?: number;
      }) => {
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

  return { tickets, loading, hasMore, count };
};

export default useTickets;
