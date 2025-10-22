var express = require('express');
var router = express.Router();
let productSchema = require('../schemas/products');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

/* GET products listing - USER, MOD, ADMIN */
router.get('/', Authentication, Authorization("USER", "MOD", "ADMIN"), async function(req, res, next) {
  try {
    let products = await productSchema.find({isDeleted:false}).populate({
      path: 'category',
      select:'name'
    });
    Response(res, 200, true, products);
  } catch (error) {
    Response(res, 500, false, error);
  }
});

/* GET product by id - USER, MOD, ADMIN */
router.get('/:id', Authentication, Authorization("USER", "MOD", "ADMIN"), async function(req, res, next) {
  try {
    let product = await productSchema.findById(req.params.id).populate({
      path: 'category',
      select:'name description'
    });
    if (!product || product.isDeleted) {
      Response(res, 404, false, "Product not found");
      return;
    }
    Response(res, 200, true, product);
  } catch (error) {
    Response(res, 404, false, error);
  }
});

/* CREATE product - MOD, ADMIN */
router.post('/', Authentication, Authorization("MOD", "ADMIN"), async function(req, res, next) {
  try {
    let newProduct = new productSchema({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
      imageURL: req.body.imageURL
    });
    await newProduct.save();
    Response(res, 200, true, newProduct);
  } catch (error) {
    Response(res, 500, false, error);
  }
});

/* UPDATE product - MOD, ADMIN */
router.put('/:id', Authentication, Authorization("MOD", "ADMIN"), async function(req, res, next) {
  try {
    let product = await productSchema.findById(req.params.id);
    if (!product || product.isDeleted) {
      Response(res, 404, false, "Product not found");
      return;
    }
    product.name = req.body.name ? req.body.name : product.name;
    product.description = req.body.description ? req.body.description : product.description;
    product.price = req.body.price ? req.body.price : product.price;
    product.category = req.body.category ? req.body.category : product.category;
    product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
    product.imageURL = req.body.imageURL ? req.body.imageURL : product.imageURL;
    await product.save();
    Response(res, 200, true, product);
  } catch (error) {
    Response(res, 500, false, error);
  }
});

/* DELETE product - ADMIN only */
router.delete('/:id', Authentication, Authorization("ADMIN"), async function(req, res, next) {
  try {
    let product = await productSchema.findById(req.params.id);
    if (!product || product.isDeleted) {
      Response(res, 404, false, "Product not found");
      return;
    }
    product.isDeleted = true;
    await product.save();
    Response(res, 200, true, "Product deleted successfully");
  } catch (error) {
    Response(res, 500, false, error);
  }
});

module.exports = router;
