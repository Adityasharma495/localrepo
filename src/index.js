const express = require('express');
const sequelize = require('./config/sequelize');
const { ServerConfig, Logger } = require('./config');
const connectMongo = require('./config/mongo-config');
const apiRoutes = require('./routes');
const swaggerRoutes = require('./routes/swagger');

const cors = require('cors');
const path = require('path');



const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors({
    //origin: 'http://localhost:3000'
    origin: '*'
}))

// Serve static files
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/temp', express.static(path.join(__dirname, '../temp')));

// API routes
app.use('/api', apiRoutes);
app.use('/api-docs', swaggerRoutes);

// Initialize the server *only after* DB connections succeed
const startServer = async () => {
  try {
    // Test CockroachDB connection
    await sequelize.authenticate();
    console.log('✅ Successfully connected to CockroachDB!');
    Logger.info('CockroachDB -> Successfully connected');

    // Sync Sequelize models
    // await sequelize.sync({ alter: true }); // Use { force: true } only in development if needed
    console.log('✅ Database synchronized successfully!');
    Logger.info('CockroachDB -> Database synchronized');

    // Connect to MongoDB
    await connectMongo();
    console.log('✅ Successfully connected to MongoDB!');
    Logger.info('MongoDB -> Successfully connected');

    // Start Express server
    app.listen(ServerConfig.PORT, () => {
      Logger.info(`Server -> Successfully started on PORT : ${ServerConfig.PORT}`);
      console.log(`🚀 Server running on PORT: ${ServerConfig.PORT}`);
    });

  } catch (error) {
    console.error('❌ Connection failed:', error);
    Logger.error(`Connection Error: ${JSON.stringify(error)}`);
    process.exit(1); // Exit if DB connections fail
  }
};


startServer();