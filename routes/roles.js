var express = require("express");
var router = express.Router();
let roleSchema = require("../schemas/roles");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  let roles = await roleSchema.find({ isDeleted: false });
  res.send({
    success: true,
    data: roles,
  });
});
router.get("/:id", async function (req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    res.send({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      data: error,
    });
  }
});

router.post("/", async function (req, res, next) {
  let newRole = new roleSchema({
    name: req.body.name,
    description: req.body.description || "",
  });
  await newRole.save();
  res.send({ success: true, data: newRole });
  // Update role
  router.put("/:id", async function (req, res, next) {
    let role = await roleSchema.findById(req.params.id);
    if (!role || role.isDelete)
      return res
        .status(404)
        .send({ success: false, message: "Role not found" });
    role.name = req.body.name ? req.body.name : role.name;
    role.description =
      req.body.description !== undefined
        ? req.body.description
        : role.description;
    await role.save();
    res.send({ success: true, data: role });
  });
  // Soft delete role
  router.delete("/:id", async function (req, res, next) {
    let role = await roleSchema.findById(req.params.id);
    if (!role || role.isDelete)
      return res
        .status(404)
        .send({ success: false, message: "Role not found" });
    role.isDelete = true;
    await role.save();
    res.send({ success: true, message: "Role soft deleted" });
  });
});

module.exports = router;
