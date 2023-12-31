const Router = require('express');
const router = new Router();
const productController = require('../controllers/ProductController');

//шлях для отримання всіх продуктів
router.get('/', productController.getProducts);

//шлях для отримання одного продукту за id
router.get('/:id', productController.getProductById);

//шлях для зміни назви продукту
router.put('/', productController.changeProductName);

module.exports = router;