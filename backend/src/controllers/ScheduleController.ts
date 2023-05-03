import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateScheduleService from "../services/ScheduleServices/CreateScheduleService";
import DeleteScheduleService from "../services/ScheduleServices/DeleteScheduleService";
import ListScheduleService from "../services/ScheduleServices/ListScheduleService";
import UpdateScheduleService from "../services/ScheduleServices/UpdateScheduleService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type ScheduleData = {
  body: string;
  contacts: string[];
  time: string;
  date: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const scheduleInfos = await ListScheduleService({
    searchParam,
    pageNumber
  });

  return res.status(200).json(scheduleInfos);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { body, time, date, contacts }: ScheduleData = req.body;
    const medias = req.files as Express.Multer.File[];
    const scheduleData = {
      user: req.user,
      body,
      medias,
      time,
      date,
      contacts: typeof contacts === "string" ? [contacts] : contacts
    };

    const schedule = await CreateScheduleService({ scheduleData });
    return res.status(201).send(schedule);
  } catch (error) {
    throw new AppError("ERR_SCHEDULING_WAPP_MSG");
  }
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { scheduleId } = req.params;
  const { body, time, date, contacts }: ScheduleData = req.body;
  const medias = req.files as Express.Multer.File[];
  const scheduleData = {
    user: req.user,
    body,
    medias,
    time,
    date,
    contacts: typeof contacts === "string" ? [contacts] : contacts
  };
  try {
    const schedule = await UpdateScheduleService({ scheduleData, scheduleId });
    return res.status(200).send(schedule);
  } catch (error) {
    throw new AppError("ERR_RESCHEDULING_WAPP_MSG");
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { scheduleId } = req.params;

  await DeleteScheduleService(scheduleId);

  return res.status(200).send();
};
