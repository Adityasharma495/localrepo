const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('cloud-telephony','admin', 'RxKs%926', {
  host: '180.150.248.156',
  dialect: 'postgres',
  port: 56829,
  dialectOptions: {
    ssl: false 
  },
  logging: false
});


module.exports = sequelize;
