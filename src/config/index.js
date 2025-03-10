module.exports = {
    ServerConfig: require('./server-config'),
    Logger: require('./logger-config'),
    ...require('./mongo-config'),
    RabbitMq: require('./rabitmq-config')
}