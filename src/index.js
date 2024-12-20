const express = require('express');
const cors = require('cors');
const path = require('path');

const { ServerConfig, Mongodb, Logger } = require('./config');
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


app.listen(ServerConfig.PORT, async() => {

    Logger.info('\n\nxxxxxxxxxxxxxxxxxxxxxxx');
    Logger.info(`Server -> Successfully started on PORT : ${ServerConfig.PORT}`);
    console.log(`Server -> Successfully started on PORT : ${ServerConfig.PORT}`);

    try {
        await Mongodb.connectMongo();
        Logger.info(`Mongodb -> Successfully connected`);
        console.log(`Mongodb -> Successfully connected`);
    } catch (error) {
        Logger.error(`Mongodb -> Error while connecting: ${ JSON.stringify(error) }`)
    }

});
