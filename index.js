require('dotenv').config();
const express = require('express');
const router = require('./router/index');
const dataFromTable = require('./dataFromTable');
const { db } = require('./models/models');

//Ініціалізація app та визначення констант
const app = express();
const PORT = process.env.PORT || 3000;


//Налаштування app
app.use(express.json());
app.use('/api', router);

const start = async () => {
    try {
        //Підключення до PostgreSQL       
        await db.authenticate();
        await db.sync();

        app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

        //Планування витягування даних з таблиці
        dataFromTable.startCronJob('0 0 */1 * * *');
    } catch (error) {
        console.log(error);
    }
}

start();