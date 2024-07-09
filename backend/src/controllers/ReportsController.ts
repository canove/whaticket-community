import { addHours } from "date-fns";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Request, Response } from "express";
import { literal, Op } from "sequelize";
import Category from "../models/Category";
import Contact from "../models/Contact";
import Message from "../models/Message";
import Queue from "../models/Queue";
import Ticket from "../models/Ticket";
import User from "../models/User";
import Whatsapp from "../models/Whatsapp";

dayjs.extend(utc);
dayjs.extend(timezone);

type IndexQuery = {
  fromDate: string;
  toDate: string;
  selectedWhatsappIds: string;
};

function findLast<T>(array: T[], callback: any): T | undefined {
  // Iterar desde el final del array hacia el principio
  for (let i = array.length - 1; i >= 0; i--) {
    // Si el callback devuelve true para el elemento actual, devolver ese elemento
    if (callback(array[i], i, array)) {
      return array[i];
    }
  }
  // Si no se encuentra ningún elemento que cumpla con la condición, devolver undefined
  return undefined;
}

function getEndOfDayInSeconds(dateString) {
  // Crear una fecha a partir de la cadena de entrada
  const date = new Date(dateString);

  // Crear una nueva fecha para el final del día en UTC
  const endOfDayUTC = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  // Obtener los milisegundos desde la época y convertir a segundos
  const endOfDaySeconds = Math.floor(endOfDayUTC.getTime() / 1000);

  return endOfDaySeconds;
}

function transformTicketsData(
  tickets,
  startDate,
  endDate,
  dateProperty = "createdAt"
) {
  console.log("transformTicketsData", { startDate, endDate });

  // Verificar si el rango de fechas es solo un día
  const isSingleDay = isSameDay(startDate, endDate);

  // Crear un objeto de fechas dentro del rango especificado
  const dateMap = {};
  let currentDate = new Date(startDate);

  if (isSingleDay) {
    // Si el rango es solo un día, agrupar por hora
    while (currentDate <= endDate) {
      const isoDate = currentDate.toISOString().split("T")[0];
      const hour = currentDate.getUTCHours();
      dateMap[`${isoDate} ${hour.toString().padStart(2, "0")}:00`] = 0;
      currentDate = addHours(currentDate, 1);
    }
  } else {
    // Si el rango abarca más de un día, agrupar por día
    while (currentDate <= endDate) {
      const isoDate = currentDate.toISOString().split("T")[0];
      dateMap[isoDate] = 0; // Inicializar contador en 0 para cada día
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Contar los tickets por fecha
  const groupedTickets = tickets.reduce((acc, ticket) => {
    let dateAsDate = ticket[dateProperty] as Date;
    let dateAsString = dateAsDate.toISOString();

    console.log("Verificar el ticket esta dentro del rango: ", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      dateAsString
    });

    // Verificar que la fecha esté dentro del rango especificado
    if (
      dateAsString >= startDate.toISOString() &&
      dateAsString <= endDate.toISOString()
    ) {
      if (isSingleDay) {
        // Agrupar por hora si el rango es un día
        const isoDate = dateAsString.split("T")[0];
        const hour = dateAsDate.getUTCHours();
        acc[`${isoDate} ${hour.toString().padStart(2, "0")}:00`]++;
      } else {
        // Agrupar por día si el rango abarca más de un día
        const isoDate = dateAsString.split("T")[0];
        acc[isoDate]++;
      }
    }

    return acc;
  }, dateMap);

  console.log("chartData", groupedTickets);

  // Convertir el objeto en un array de objetos
  const chartData = Object.keys(groupedTickets).map(date => ({
    date,
    count: groupedTickets[date]
  }));

  // Ordenar los datos por fecha
  chartData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return chartData;
}

// Función para verificar si dos fechas son del mismo día
function isSameDay(date1, date2) {
  console.log("isSameDay", date1.toISOString(), date2.toISOString());

  return (
    date1.toISOString().split("T")[0] === date2.toISOString().split("T")[0]
  );
}

export const generalReport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    fromDate: fromDateAsString,
    toDate: toDateAsString,
    selectedWhatsappIds: selectedUserIdsAsString
  } = req.query as IndexQuery;

  console.log({ fromDateAsString, toDateAsString });

  // Parse the date strings without converting to UTC
  const fromDate = new Date(fromDateAsString.replace(/-05:00$/, "Z"));
  const toDate = new Date(toDateAsString.replace(/-05:00$/, "Z"));

  console.log({ fromDate, toDate });

  let createdTicketsChartData: null | any[] = null;
  let createdTicketsData: null | Ticket[] = null;
  let createdTicketsCount: null | number = null;
  let tprData: null | any = null;
  let tprPromedio: null | number = null;
  let createdTicketsClosedInTheRangeTimeChartData: null | any[] = null;
  let createdTicketsClosedInTheRangeTimeData: null | Ticket[] = null;
  let createdTicketsClosedInTheRangeTimeCount: null | number = null;
  let tdrData: null | any = null;
  let tdrPromedio: null | number = null;

  const selectedWhatsappIds = JSON.parse(selectedUserIdsAsString) as number[];

  const createdTickets = await Ticket.findAll({
    where: {
      createdAt: {
        [Op.gte]: dayjs(fromDateAsString).utc().toDate(),
        [Op.lte]: dayjs(toDateAsString).utc().toDate()
      },
      isGroup: false,
      ...(selectedWhatsappIds.length > 0 && {
        whatsappId: {
          [Op.in]: selectedWhatsappIds
        }
      })
    },
    include: [
      {
        model: Message,
        as: "messages",
        order: [["timestamp", "ASC"]],
        required: false,
        separate: true
      },
      {
        model: Contact,
        as: "contact",
        required: false
      },
      {
        model: User,
        as: "user",
        required: false
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        required: false
      }
    ]
  });

  let createdTicketsWithClientHours = createdTickets.map(ticket => {
    const modifiedTicket = JSON.parse(JSON.stringify(ticket)) as Ticket;

    modifiedTicket.createdAt = dayjs(modifiedTicket.createdAt)
      .subtract(5, "hours")
      .toDate();
    modifiedTicket.updatedAt = dayjs(modifiedTicket.updatedAt)
      .subtract(5, "hours")
      .toDate();

    return modifiedTicket;
  });

  createdTicketsData = createdTicketsWithClientHours;
  createdTicketsChartData = transformTicketsData(
    createdTicketsWithClientHours,
    fromDate,
    toDate
  );
  createdTicketsCount = createdTicketsWithClientHours.length;

  // console.log({
  //   createdTicketsCount: createdTickets.length,
  //   createdTickets: createdTickets.map(row => {
  //     return { id: row.id, lastMessage: row.lastMessage };
  //   })
  // });

  const createdTicketsWithFirstClientMessage =
    createdTicketsWithClientHours.filter(
      ticket =>
        ticket.messages?.length > 0 && ticket.messages[0].fromMe === false
    );

  const createdTicketsClosedInTheRangeTime =
    createdTicketsWithClientHours.filter(ticket => {
      const lastCloseMessage = findLast(ticket.messages, (message: Message) => {
        return message.body.includes("*resolvió* la conversación");
      });

      // console.log("createdTicketsClosedInTheRangeTime", {
      //   lastCloseMessage,
      //   dateConlaQueSeVaAComparar: getEndOfDayInSeconds(toDateAsString),
      //   lastCloseMessageTimestampIsValid:
      //     lastCloseMessage?.timestamp < getEndOfDayInSeconds(toDateAsString),
      //   ticketStatus: ticket.status === "closed"
      // });

      return (
        lastCloseMessage &&
        lastCloseMessage.timestamp < getEndOfDayInSeconds(toDateAsString) &&
        ticket.status === "closed"
      );
    });

  if (createdTicketsClosedInTheRangeTime.length > 0) {
    createdTicketsClosedInTheRangeTimeData = createdTicketsClosedInTheRangeTime;
    createdTicketsClosedInTheRangeTimeCount =
      createdTicketsClosedInTheRangeTime.length;
    createdTicketsClosedInTheRangeTimeChartData = transformTicketsData(
      createdTicketsClosedInTheRangeTime,
      fromDate,
      toDate,
      "updatedAt"
    );

    // console.log({
    //   createdTicketsClosedInTheRangeTimeCount:
    //     createdTicketsClosedInTheRangeTime.length,
    //   createdTicketsClosedInTheRangeTime:
    //     createdTicketsClosedInTheRangeTime.map(row => {
    //       return { id: row.id, lastMessage: row.lastMessage };
    //     })
    // });

    tdrData = createdTicketsClosedInTheRangeTime.map(ticket => {
      const firstMessage = ticket.messages[0];
      const lastMessage = ticket.messages[ticket.messages.length - 1];

      const firstMessageTimestamp = firstMessage.timestamp;
      const lastMessageTimestamp = lastMessage.timestamp;

      return {
        ticket: ticket,
        tdrItem: lastMessageTimestamp - firstMessageTimestamp,
        tdrFirstMessage: firstMessage,
        tdrFirstUserMessage: lastMessage
      };
    });
    tdrPromedio =
      tdrData.reduce((acc, row) => acc + row.tdrItem, 0) / tdrData.length;
  } else {
    createdTicketsClosedInTheRangeTimeCount = 0;
    // console.log("----- No hay tickets cerrados en el rango de tiempo");
  }

  // const

  if (createdTicketsWithFirstClientMessage.length > 0) {
    tprData = createdTicketsWithFirstClientMessage.map(ticket => {
      const firstMessage = ticket.messages[0];
      const firstUserMessage = ticket.messages.find(
        message => message.fromMe === true
      );

      const firstMessageTimestamp = firstMessage.timestamp;
      const firstUserMessageTimestamp = firstUserMessage
        ? firstUserMessage.timestamp
        : Date.now() / 1000;

      return {
        ticket: ticket,
        tprItem: firstUserMessageTimestamp - firstMessageTimestamp,
        tprFirstMessage: firstMessage,
        tprFirstUserMessage: firstUserMessage
      };
    });
    tprPromedio =
      tprData.reduce((acc, row) => acc + row.tprItem, 0) / tprData.length;

    // console.log({
    //   createdTicketsWithFirstClientMessageCount:
    //     createdTicketsWithFirstClientMessage.length,
    //   createdTicketsWithFirstClientMessage:
    //     createdTicketsWithFirstClientMessage.map(row => {
    //       return { id: row.id, lastMessage: row.lastMessage };
    //     }),
    //   tprData,
    //   tprPromedio:
    //     tprData.reduce((acc, row) => acc + row.tprItem, 0) / tprData.length
    // });
  }

  return res.status(200).json({
    createdTicketsChartData,
    createdTicketsData,
    createdTicketsCount,
    tprData,
    tprPromedio,
    createdTicketsClosedInTheRangeTimeChartData,
    createdTicketsClosedInTheRangeTimeData,
    createdTicketsClosedInTheRangeTimeCount,
    tdrData,
    tdrPromedio
  });
};

export const responseTimes = async (
  req: Request,
  res: Response
): Promise<Response> => {
  console.log("---------------responseTimes");

  const { selectedWhatsappIds: selectedUserIdsAsString } =
    req.query as IndexQuery;

  const selectedWhatsappIds = JSON.parse(selectedUserIdsAsString) as number[];

  const ticketsWithAllMessages = await Ticket.findAll({
    where: {
      status: { [Op.or]: ["open", "pending"] },
      ...(selectedWhatsappIds.length > 0 && {
        whatsappId: {
          [Op.in]: selectedWhatsappIds
        }
      })
    },
    include: [
      {
        model: Contact,
        as: "contact",
        required: false
      },
      {
        model: User,
        as: "user",
        required: false
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"],
        required: false
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["name"],
        required: false
      },
      {
        model: Category,
        as: "categories",
        attributes: ["id", "name", "color"]
      },
      {
        model: User,
        as: "helpUsers",
        required: false
      },
      {
        model: User,
        as: "participantUsers",
        required: false
      },
      {
        model: Message,
        as: "firstClientMessageAfterLastUserMessage",
        attributes: ["id", "body", "timestamp"],
        order: [["timestamp", "ASC"]],
        required: false,
        separate: true,
        limit: 1,
        where: {
          isPrivate: {
            [Op.or]: [false, null]
          },
          fromMe: false,
          timestamp: {
            [Op.gt]: literal(
              `(SELECT MAX(mes.timestamp) FROM Messages mes WHERE mes.ticketId = Message.ticketId AND mes.fromMe = 1 AND (mes.isPrivate = 0 OR mes.isPrivate IS NULL))`
            )
          }
        }
      },
      {
        model: Message,
        as: "messages",
        order: [["timestamp", "DESC"]],
        required: false,
        limit: 25,
        separate: true,
        include: [
          {
            model: Contact,
            as: "contact",
            required: false
          }
        ]
      }
    ]
  });

  ticketsWithAllMessages.forEach(ticket => {
    ticket.messages.sort((a, b) => a.timestamp - b.timestamp);
  });

  return res.status(200).json({ ticketsWithAllMessages });
};
