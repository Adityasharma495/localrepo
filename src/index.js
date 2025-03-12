const express = require('express');
const cors = require('cors');
const path = require('path');

const { ServerConfig, MongoDB, Logger, connectSequelize } = require('./config');
const apiRoutes = require('./routes');
const swaggerRoutes = require('./routes/swagger');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors({
    //origin: 'http://localhost:3000'
    origin: '*'
}))

//Any request with /api
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/temp', express.static(path.join(__dirname, '../temp')));

app.use('/api', apiRoutes);
app.use('/api-docs', swaggerRoutes);


const startServer = async () => {
    try {
        await MongoDB();
        Logger.info(`MongoDB -> Successfully connected`);
        console.log(`MongoDB -> Successfully connected`);
        
        await connectSequelize();
        Logger.info(`MySQL -> Successfully connected`);
        console.log(`MySQL -> Successfully connected`);

        app.listen(ServerConfig.PORT, () => {
            Logger.info('\n\nxxxxxxxxxxxxxxxxxxxxxxx');
            Logger.info(`Server -> Successfully started on PORT : ${ServerConfig.PORT}`);
            console.log(`Server -> Successfully started on PORT : ${ServerConfig.PORT}`);
        });
    } catch (error) {
        Logger.error(`Error while starting the server: ${JSON.stringify(error)}`);
        console.error(`Error while starting the server:`, error);
        process.exit(1);  // Exit process if DB connections fail
    }
};

// Start the server
startServer();
