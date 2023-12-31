const mongoose = require('mongoose');
const { Schema } = mongoose;

//Mongoose Schema для визначення представлення продуктів у БД MongoDB
const productSchema = new Schema({
    model: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    article: {
        type: Number,
        required: true
    },
    sizes: {
        type: Array,
        required: true
    },
});

//Створення моделі для роботи з БД
const Product = mongoose.model('products', productSchema);

module.exports = Product;