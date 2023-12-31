const { Models, Products } = require('../models/models'); // Припускаючи, що у вас є файли models.js з визначеннями моделей Sequelize
const Sequelize = require('sequelize');

class ProductController {
    /**
     * Повертає товари. Якщо не передаються параметри, повертає всі товари з БД, якщо передаються параметри, повертає товари за параметрами
     * @param {*} req
     * @param {*} res
     */
    async getProducts(req, res) {
        try {
            if (Object.keys(req.query).length !== 0) {
                let { sizes } = req.query;
                sizes = Array.isArray(sizes) ? sizes.map(Number) : [Number(sizes)];
                const products = await Products.findAll({
                    where: {
                        sizes: {
                            [Sequelize.Op.overlap]: sizes,
                        },
                    },
                });
                res.json({ products });
            } else {
                const products = await Products.findAll();
                res.json({ products });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Повертає товар за id з бази даних
     * @param {*} req
     * @param {*} res
     */
    async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await Products.findOne({ where: { article: id } });
            res.json({ product });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Змінює назву продукту. Отримує продукт за id та нову назву з req.body
     * @param {*} req
     * @param {*} res
     */
    async changeProductName(req, res) {
        try {
            const { id, name } = req.body;
            await Products.update({ name }, { where: { _id: id } });
            const updatedProduct = await Products.findByPk(id);
            res.json({ updatedProduct });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Створює новий товар та додає його в БД
     * @param {Object} models
     */
    async addProducts(models) {
        try {
            for (const model in models) {
                for (const product of models[model]) {
                    const productFromDB = await Products.findOne({ where: { article: product.article, modelName: model } });

                    if (!productFromDB) {
                        await Products.create({ modelName: model, ...product });
                    } else if (JSON.stringify({ modelName: model, ...product }) !== JSON.stringify(productFromDB)) {
                        await Products.update({ modelName: model, ...product }, { where: { article: product.article, modelName: model } });
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = new ProductController();
