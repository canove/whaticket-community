import { Op, Sequelize } from "sequelize";
import Message from "../../models/Message";
import { remove as removeDiacritics } from "diacritics";

interface SearchParams {
  ticketId: string;
  term: string;
  offset: number;
  limit: number;
  lastMessageId?: number;
}

const SearchMessagesService = async ({
  ticketId,
  term,
  offset,
  limit,
  lastMessageId,
}: SearchParams) => {
  // 1. Normalizar o termo de busca
  const normalizedTerm = removeDiacritics(term).toLowerCase().replace(/-/g, " ");

  // 2. Configuração da consulta
  const whereCondition = {
    ticketId,
    [Op.and]: Sequelize.where(
      Sequelize.fn("LOWER", Sequelize.col("body")),
      { [Op.like]: `%${normalizedTerm}%` }
    ),
    ...(lastMessageId && { id: { [Op.gt]: lastMessageId } }),
  };

  // 3. Executar a consulta com ordenação e limite
  const messages = await Message.findAll({
    where: whereCondition,
    order: [["id", "ASC"]],
    limit,
  });

  return messages;
};

export default SearchMessagesService;
