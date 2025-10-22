var express = require('express');
var router = express.Router();
let roleSchema = require('../schemas/roles');
let { Response } = require('../utils/responseHandler');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let roles = await roleSchema.find({isDeleted:false});
  Response(res, 200, true, roles);
});
router.get('/:id', async function(req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    Response(res, 200, true, role);
  } catch (error) {
    Response(res, 404, false, error);
  }
});

router.post('/', async function(req, res, next) {
  let newRole = new roleSchema({
    name:req.body.name
  })
  await newRole.save();
  Response(res, 200, true, newRole);
});

module.exports = router;
