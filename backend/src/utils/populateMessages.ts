
import sequelize from "../database";
import Contact from "../models/Contact"; 
import Message from "../models/Message";
import Ticket from "../models/Ticket";

const populateMessages = async () => {
  try {
    // Garantir que a conexão foi bem-sucedida
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados bem-sucedida!');

    // Buscar alguns tickets e contatos para associar com as mensagens
    const tickets = await Ticket.findAll();
    const contacts = await Contact.findAll();

    if (tickets.length === 0 || contacts.length === 0) {
      console.log('Não há tickets ou contatos suficientes no banco!');
      return;
    }

    // Gerar 100 mensagens fictícias
    const fakeMessages = [];
    for (let i = 1; i <= 10000; i++) {
      const ticket = tickets[Math.floor(Math.random() * tickets.length)];
      const contact = contacts[Math.floor(Math.random() * contacts.length)];

      fakeMessages.push({
        id: `msg-${i}`,
        body: `Mensagem de teste número ${i}`,
        ack: 0,
        read: false,
        fromMe: Math.random() < 0.5,  // Aleatório entre true/false
        mediaUrl: null,  // Para teste sem media
        mediaType: null,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ticketId: ticket.id,
        contactId: contact.id,
        quotedMsgId: null,  // Sem mensagens citadas
      });
    }

    // Inserir as mensagens no banco
    await Message.bulkCreate(fakeMessages);
    console.log('Mensagens inseridas com sucesso!');

    // Fechar a conexão
    await sequelize.close();
  } catch (error) {
    console.error('Erro ao popular mensagens:', error);
  }
};

// Executar a função
populateMessages();
