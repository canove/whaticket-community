const { Sequelize, DataTypes } = require("sequelize");
const { faker } = require("@faker-js/faker");

// Database configuration
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: false,
    }
);

const run = async () => {
    try {
        console.log("Connecting to database...");
        await sequelize.authenticate();
        console.log("Connected.");

        // Find or create a ticket to populate
        // We'll use ticket ID 1 for simplicity, or create one if it doesn't exist
        // Assuming Tickets table exists and has at least one user/contact/whatsapp
        // For safety, let's just assume ticketId = 1 exists or user will use an existing one.
        // Actually, let's check if ticket 1 exists, if not create a dummy one.

        // Check for Ticket 1
        const [tickets] = await sequelize.query("SELECT id FROM Tickets WHERE id = 1");
        let ticketId = 1;

        if (tickets.length === 0) {
            console.log("Ticket 1 not found. Please ensure at least one ticket exists.");
            // Try to find ANY ticket
            const [anyTicket] = await sequelize.query("SELECT id FROM Tickets LIMIT 1");
            if (anyTicket.length > 0) {
                ticketId = anyTicket[0].id;
                console.log(`Using existing Ticket ID: ${ticketId}`);
            } else {
                console.error("No tickets found in database. Please create a ticket first via the UI.");
                process.exit(1);
            }
        } else {
            console.log(`Using Ticket ID: ${ticketId}`);
        }

        const TOTAL_MESSAGES = 1000000;
        const BATCH_SIZE = 5000;
        const TOTAL_BATCHES = Math.ceil(TOTAL_MESSAGES / BATCH_SIZE);

        console.log(`Starting seed of ${TOTAL_MESSAGES} messages for Ticket ${ticketId}...`);

        for (let i = 0; i < TOTAL_BATCHES; i++) {
            const messages = [];
            for (let j = 0; j < BATCH_SIZE; j++) {
                const isFromMe = Math.random() > 0.5;
                messages.push({
                    id: `seed-${i}-${j}-${Date.now()}`, // Unique ID
                    body: `Message ${i * BATCH_SIZE + j}: ${faker.lorem.sentence()} - ${faker.lorem.words(3)}`,
                    ticketId: ticketId,
                    fromMe: isFromMe,
                    read: true,
                    ack: 1,
                    isDeleted: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    mediaType: "chat"
                });
            }

            // Bulk Insert
            // We use raw query for speed or Sequelize bulkInsert
            // Using QueryInterface would be cleaner but we are in a standalone script.
            // Let's use raw insert for maximum speed and simplicity in this context

            const values = messages.map(m => {
                return `('${m.id}', '${m.body.replace(/'/g, "''")}', ${m.ticketId}, ${m.fromMe}, 1, 1, 0, NOW(), NOW(), 'chat')`;
            }).join(",");

            const query = `INSERT INTO Messages (id, body, ticketId, fromMe, \`read\`, ack, isDeleted, createdAt, updatedAt, mediaType) VALUES ${values};`;

            await sequelize.query(query);

            if ((i + 1) % 10 === 0) {
                console.log(`Inserted batch ${i + 1}/${TOTAL_BATCHES} (${(i + 1) * BATCH_SIZE} messages)`);
            }
        }

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

run();
