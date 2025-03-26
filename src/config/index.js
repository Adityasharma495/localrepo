module.exports = {
    ServerConfig: require('./server-config'),
    Logger: require('./logger-config'),
    MongoDB : require('./mongo-config'),
    ...require('./sequelize-config'),
    RabbitMq: require('./rabitmq-config')
}