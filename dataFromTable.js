require('dotenv').config();
const axios = require('axios');
const cron = require('node-cron');
const productController = require('./controllers/ProductController');

class ProductUpdater {
    constructor() {
        this.models = []
        this.data = {}
        this.apiKey = process.env.API_KEY
        this.spreadsheetId = process.env.SPREADSHEET_ID  
    }
    
    /**
     * Витягує дані з таблиці, які є наявні моделі
     */
    async fetchModels() {
        return axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}?fields=sheets(properties(title%2CsheetId))&key=${this.apiKey}`)
            .then(res => res.data.sheets.map(sheet => sheet.properties.title))
            .then(res => this.models = res)
            .catch(err => console.log(err));
    }

    /**
     * Витягує дані з таблички про певну модель
     * @param {String} model 
     */
    async fetchDataFromTables(model) {
        try {
            const response = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/'${model}'?key=${this.apiKey}`);

            const modelData = this.processResponse(response.data.values);
            this.data[model] = modelData;
        } catch (error) {
            console.error(`Помилка при запиті для моделі ${model}: ${error}`);
        }
    }

    processResponse(responseData) {
        const names = responseData.filter(row => row.includes('Імя '));
        const prices = responseData.filter(row => row.includes('Ціна'));
        const articles = responseData.filter(row => row.includes('Код товару'));
        const sizes = responseData.filter(row => !isNaN(Number(row[0])) && row.includes('+'));
        const processedData = this.generateProducts(...names, ...prices, ...articles, sizes);
        return processedData;
    }

    /**
     * Створює масив з об'єктами товарів
     * @param {Array<String>} names 
     * @param {Array<String>} prices 
     * @param {Array<String>} articles 
     * @param {Array<Array<String>>} sizes 
     * @returns {Array<Object>}
     */
    generateProducts(names, prices, articles, sizes) {
        const products = [];
        for (let horizontal = 1; horizontal < names.length; horizontal++) {
            let name = names[horizontal];
            let price = prices[horizontal];
            let article = articles[horizontal];
            let productSizes = [];
            for (let j = 0; j < sizes.length; j++) {
                if (sizes[j][horizontal] === '+') {
                    productSizes.push(Number(sizes[j][0]))
                }
            }
            products.push({ name, price, article, sizes: productSizes });
        }
        return products;
    }

    /**
     * Оновлює дані про товари
     */
    async updateData() {
        await this.fetchModels();
        for (const model of this.models) {
            await this.fetchDataFromTables(model);
        }

        this.compareAndUpdate();
    }

    /**
     * Порівнює та оновлює дані, якщо вони змінились від попереднього запиту
     */
    compareAndUpdate() {
        for (const model in this.models) {
            if (this.data.hasOwnProperty(model)) {
                const newData = this.fetchDataFromTables(model);
                const currentData = this.getCurrentDataForModel(model);

                if (!this.areArraysEqual(newData, currentData)) {
                    this.updateModelData(model, newData);
                }
            }
        }
    }

    /**
     * Повертає дані моделі, якщо вони є, інакше повертає пустий масив
     * @param {String} model 
     * @returns {Array}
     */
    getCurrentDataForModel(model) {
        return this.data[model] || [];
    }

    /**
     * Оновлює дані для моделі
     * @param {String} model 
     * @param {Array} newData 
     */
    updateModelData(model, newData) {
        this.data[model] = newData;
    }

    /**
     * Порівнює масиви
     * @param {Array} arr1 
     * @param {Array} arr2 
     * @returns {Boolean}
     */
    areArraysEqual(arr1, arr2) {
        return JSON.stringify(arr1) === JSON.stringify(arr2);
    }

    /**
     * Відправляє дані для валідації на контролері та збереження у БД
     * @param {Object} data 
     */
    async toDataBase(data) {
        await productController.addProducts(data);
    }

    /**
     * Запускає cron-завдання для регулярного оновлення
     * @param {String} schedule 
     */
    startCronJob(schedule) {
        cron.schedule(schedule, async () => {
            console.log('Оновлення даних...');
            await this.updateData();
            console.log('Відправка даних для валідації та збереження в БД...')
            await this.toDataBase(this.data);
        });
    }
}

module.exports = new ProductUpdater();