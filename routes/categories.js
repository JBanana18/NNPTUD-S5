var express = require('express');
var router = express.Router();
let categorySchema = require('../schemas/categories');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

/* GET categories listing - USER, MOD, ADMIN */
router.get('/', Authentication, Authorization("USER", "MOD", "ADMIN"), async function(req, res, next) {
  try {
    let categories = await categorySchema.find({isDeleted:false});
    Response(res, 200, true, categories);
  } catch (error) {
    Response(res, 500, false, error);
  }
});

/* GET category by id - USER, MOD, ADMIN */
router.get('/:id', Authentication, Authorization("USER", "MOD", "ADMIN"), async function(req, res, next) {
  try {
    let category = await categorySchema.findById(req.params.id);
    if (!category || category.isDeleted) {
      Response(res, 404, false, "Category not found");
      return;
    }
    Response(res, 200, true, category);
  } catch (error) {
    Response(res, 404, false, error);
  }
});

/* CREATE category - MOD, ADMIN */
router.post('/', Authentication, Authorization("MOD", "ADMIN"), async function(req, res, next) {
  try {
    let newCategory = new categorySchema({
      name: req.body.name,
      description: req.body.description
    });
    await newCategory.save();
    Response(res, 200, true, newCategory);
  } catch (error) {
    Response(res, 500, false, error);
  }
});

/* UPDATE category - MOD, ADMIN */
router.put('/:id', Authentication, Authorization("MOD", "ADMIN"), async function(req, res, next) {
  try {
    let category = await categorySchema.findById(req.params.id);
    if (!category || category.isDeleted) {
      Response(res, 404, false, "Category not found");
      return;
    }
    category.name = req.body.name ? req.body.name : category.name;
    category.description = req.body.description ? req.body.description : category.description;
    await category.save();
    Response(res, 200, true, category);
  } catch (error) {
    Response(res, 500, false, error);
  }
});

/* DELETE category - ADMIN only */
router.delete('/:id', Authentication, Authorization("ADMIN"), async function(req, res, next) {
  try {
    let category = await categorySchema.findById(req.params.id);
    if (!category || category.isDeleted) {
      Response(res, 404, false, "Category not found");
      return;
    }
    category.isDeleted = true;
    await category.save();
    Response(res, 200, true, "Category deleted successfully");
  } catch (error) {
    Response(res, 500, false, error);
  }
});

module.exports = router;
