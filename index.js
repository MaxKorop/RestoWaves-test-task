require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = require('./router/index');
const dataFromTable = require('./dataFromTable');
const cron = require('node-cron');

//Ініціалізація app та визначення констант
const app = express();
const PORT = process.env.PORT || 3000;
const mongoDBConnectionString = process.env.DB_CONNECTION_STRING;


//Налаштування app
app.use(express.json());
app.use('/api', router);

const start = () => {
    try {
        //Підключення до MongoDB
        mongoose.connect(mongoDBConnectionString)
            .then(() => console.log("Mongoose connected"))
            .catch((err) => console.log(`MongoDB connection error: ${err}`));
        
        app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

        //Планування витягування даних з таблиці
        dataFromTable.startCronJob('0 0 */1 * * *');
    } catch (error) {
        console.log(error);
    }
}

start();