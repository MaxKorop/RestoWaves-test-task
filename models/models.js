// models.js
const Sequelize = require('sequelize');
const { DataTypes } = Sequelize;
const db = new Sequelize(process.env.DB_CONNECTION_STRING);

// Модель Models
const Models = db.define('models', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Модель Products
const Products = db.define('products', {
    modelName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    article: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    sizes: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: false,
    },
});

Models.hasMany(Products);
Products.belongsTo(Models);

module.exports = { Models, Products, db };
