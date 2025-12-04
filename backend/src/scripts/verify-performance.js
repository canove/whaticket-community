const { Sequelize } = require("sequelize");

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

        const ticketId = 1;
        const searchTerm = "Message 500000"; // Specific term we know exists
        const query = `
      SELECT * FROM Messages 
      WHERE ticketId = ${ticketId} 
      AND MATCH(body) AGAINST('"Message 500000"' IN BOOLEAN MODE) 
      LIMIT 20 OFFSET 0;
    `;

        console.log(`Executing search for "${searchTerm}" on Ticket ${ticketId}...`);

        const start = process.hrtime();
        const [results] = await sequelize.query(query);
        const end = process.hrtime(start);

        const timeInMs = (end[0] * 1000 + end[1] / 1e6).toFixed(2);

        console.log(`Search completed in ${timeInMs} ms`);
        console.log(`Found ${results.length} results.`);

        if (results.length > 0) {
            console.log("First result body:", results[0].body);
        }

        if (parseFloat(timeInMs) < 2000) {
            console.log("SUCCESS: Performance is under 2 seconds.");
            process.exit(0);
        } else {
            console.error("FAILURE: Performance is over 2 seconds.");
            process.exit(1);
        }

    } catch (error) {
        console.error("Error verifying performance:", error);
        process.exit(1);
    }
};

run();
