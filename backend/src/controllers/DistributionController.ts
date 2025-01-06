import { Request, Response } from "express";

import Distribution from "../models/Distribution";
import Ticket from "../models/Ticket";

import ListDistributionService from "../services/DistributionServices/ListDistributionService";
import CreateOrUpdateDistributionService from "../services/DistributionServices/CreateOrUpdateDistributionService";

export const index = async (req: Request, res: Response): Promise<Response> => {  
  const { queueId } = req.params;

  try {
    const distributions = await ListDistributionService(Number(queueId));
    return res.json(distributions);
  } catch (error) {
    console.error("Erro ao listar distribuições:", error);
    return res.status(500).json({ error: "Erro ao listar distribuições" });
  }
};

export const toggleDistribution = async (req: Request, res: Response): Promise<Response> => {
  const { queueId, userIds, current_user, is_active } = req.body;  

  try {
    await CreateOrUpdateDistributionService({ queueId, userIds, current_user, is_active });
    return res.status(200).json({ message: "Distribuição atualizada com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar distribuição:", error);
    return res.status(500).json({ error: "Erro ao atualizar distribuição" });
  }
};

export const startDistribution = async (req: Request, res: Response) => {
  const { queueId } = req.body;

  try {
    const distribution = await Distribution.findOne({ 
      where: { queue_id: queueId, is_active: 1 } 
    });

    if (!distribution) {
      return res.status(400).json({ message: "Distribuição ativa não encontrada." });
    }

    const userIds = JSON.parse(distribution.user_ids as any);
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Lista de usuários inválida." });
    }

    const tickets = await Ticket.findAll({
      where: { queueId },
      order: [["createdAt", "ASC"]],
    });

    if (!tickets.length) {
      return res.status(200).json({ message: "Nenhum ticket encontrado para distribuir." });
    }

    console.log(`Tickets encontrados: ${tickets.length}`);

    let currentUserIndex = userIds.indexOf(Number(distribution.current_user));
    if (currentUserIndex === -1) currentUserIndex = 0;

    for (const ticket of tickets) {
      const nextUserIndex = (currentUserIndex + 1) % userIds.length;
      const nextUserId = userIds[nextUserIndex];

      ticket.userId = nextUserId;
      await ticket.save();

      console.log(`Ticket ${ticket.id} atualizado para usuário ${nextUserId}`);

      currentUserIndex = nextUserIndex;
    }

    const lastAssignedUserId = userIds[currentUserIndex];
    distribution.current_user = lastAssignedUserId.toString();
    await distribution.save();

    res.status(200).json({ 
      message: "Distribuição realizada com sucesso!", 
      totalTicketsUpdated: tickets.length, 
      lastAssignedUserId 
    });
  } catch (error) {
    console.error("Erro ao processar a distribuição:", error);
    res.status(500).json({ message: "Erro ao processar a distribuição.", error });
  }
};
