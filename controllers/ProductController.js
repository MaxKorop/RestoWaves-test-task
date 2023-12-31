const Product = require('../schemas/product');

class ProductController {
    /**
        *Повертає товари. Якщо не передаються параметри, повертає всі товари з БД, якщо передаються параметри, повертає товари за параметрами
        * @param {*} req 
        * @param {*} res 
    */
    async getProducts(req, res) {
        if (Object.keys(req.query).length !== 0) {
            console.log(req.query);
            let { sizes } = req.query;
            let products;
            if (sizes instanceof Array) {
                products = await Product.find({ sizes: { $in: [...sizes].map(Number) } });
            } else {
                products = await Product.find({ sizes: Number(sizes) });
            }
            res.json({ products });
        } else {
            const products = await Product.find();
            res.json({ products });
        }
    }

    /**
        * Повертає товар за id з бази даних
        * @param {*} req
        * @param {*} res 
    */
    async getProductById(req, res) {
        const { id } = req.params;
        const product = await Product.findOne({ article: id });
        res.json({ product });
    }

    /**
        * Змінює назву продукту. Отримує продукт за id та нову назву з req.body
        * @param {*} req 
        * @param {*} res 
    */
    async changeProductName(req, res) {
        const { id, name } = req.body;
        console.log(id, name);
        await Product.updateOne({ _id: id }, { $set: { name: name } }, { new: true });
        const updatedProduct = await Product.findById(id);
        res.json({ updatedProduct });
    }

    /**
     * Створює новий товар та додає його в БД
     * @param {Object} product 
     */
    async addProducts(models) {
        for (const model in models) {
            models[model].map(async (product) => {
                const productFromDB = await Product.find({ article: product.article, model: model });
                if (!productFromDB.length) {
                    const newProduct = await Product.create({ model, ...product });
                } else if (JSON.stringify({ model, ...product }) !== JSON.stringify(productFromDB)) {
                    const updatedProduct = await Product.updateOne({ article: product.article, model: model }, { $set: { model, ...product } });
                }
            })
        }
    }
}

module.exports = new ProductController();