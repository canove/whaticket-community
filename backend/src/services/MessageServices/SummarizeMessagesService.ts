import OpenAI from "openai";
import Message from "../../models/Message.js";
import Contact from "../../models/Contact.js";
import CheckSettings from "../../helpers/CheckSettings.js";
import AppError from "../../errors/AppError.js";

const SummarizeMessagesService = async (
  ticketId: string | number
): Promise<string> => {
  const apiKey = await CheckSettings("openAiKey");

  if (!apiKey || apiKey.trim() === "") {
    throw new AppError("ERR_NO_OPENAI_KEY", 400);
  }

  const messages = await Message.findAll({
    where: { ticketId },
    order: [["createdAt", "ASC"]],
    include: [{ model: Contact, as: "contact", attributes: ["name"] }]
  });

  if (messages.length === 0) {
    throw new AppError("ERR_NO_MESSAGES_TO_SUMMARIZE", 400);
  }

  const conversation = messages
    .filter(m => m.body && m.body.trim() !== "")
    .map(m => {
      const sender = m.fromMe ? "Atendente" : m.contact?.name || "Cliente";
      return `${sender}: ${m.body}`;
    })
    .join("\n");

  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Você é um assistente especializado em analisar conversas de atendimento ao cliente. " +
          "Faça uma análise concisa em português, estruturada nas seguintes seções com títulos em negrito:\n" +
          "**Assunto principal:** o tema central da conversa.\n" +
          "**Principais pontos:** os tópicos mais relevantes discutidos.\n" +
          "**Resultado/decisão:** o desfecho ou conclusão da conversa.\n" +
          "**Humor do cliente:** análise do tom emocional e sentimento do cliente ao longo da conversa (ex: satisfeito, animado, hesitante, frustrado, neutro, etc.), com breve justificativa baseada nas mensagens.\n" +
          "REGRA OBRIGATÓRIA: Se o humor do cliente for frustrado, irritado, insatisfeito ou raivoso, ou se houver qualquer sinal de reclamação, conflito, desentendimento ou mal-entendido entre cliente e atendente, você DEVE incluir obrigatoriamente como última seção:\n" +
          "**Alerta de desentendimento:** descrição clara do problema identificado na conversa.\n" +
          "Apenas omita essa seção se o cliente estiver claramente satisfeito ou neutro durante toda a conversa. Seja direto e objetivo em cada seção."
      },
      {
        role: "user",
        content: `Resumo a seguinte conversa de atendimento:\n\n${conversation}`
      }
    ],
    max_tokens: 600,
    temperature: 0.3
  });

  return response.choices[0].message.content || "";
};

export default SummarizeMessagesService;
