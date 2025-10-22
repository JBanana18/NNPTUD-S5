var express = require("express");
var router = express.Router();
let users = require("../schemas/users");
let roles = require("../schemas/roles");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  // Search by username or fullName (contains)
  const { username, fullName } = req.query;
  let query = { isDelete: false };
  if (username) query.username = { $regex: username, $options: "i" };
  if (fullName) query.fullName = { $regex: fullName, $options: "i" };
  let allUsers = await users.find(query).populate({
    path: "role",
    select: "name",
  });
  res.send({
    success: true,
    data: allUsers,
  });
});
router.get("/:id", async function (req, res, next) {
  try {
    let getUser = await users.findById(req.params.id);
    if (!getUser || getUser.isDelete) {
      return res.status(404).send({ success: false, message: "ID not found" });
    }
    res.send({ success: true, data: getUser });
  } catch (error) {
    res.status(400).send({ success: false, data: error });
  }
  // Get by username
  router.get("/by-username/:username", async function (req, res, next) {
    let user = await users.findOne({
      username: req.params.username,
      isDelete: false,
    });
    if (!user)
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    res.send({ success: true, data: user });
  });
});

router.post("/", async function (req, res, next) {
  let roleName = req.body.role ? req.body.role : "USER";
  let role = await roles.findOne({ name: roleName });
  let roleId = role ? role._id : null;
  let newUser = new users({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    role: roleId,
  });
  await newUser.save();
  res.send({ success: true, data: newUser });
});
router.put("/:id", async function (req, res, next) {
  let user = await users.findById(req.params.id);
  if (!user || user.isDelete)
    return res.status(404).send({ success: false, message: "User not found" });
  user.email = req.body.email ? req.body.email : user.email;
  user.fullName = req.body.fullName ? req.body.fullName : user.fullName;
  user.password = req.body.password ? req.body.password : user.password;
  user.avatarUrl = req.body.avatarUrl ? req.body.avatarUrl : user.avatarUrl;
  user.status = req.body.status !== undefined ? req.body.status : user.status;
  user.role = req.body.role ? req.body.role : user.role;
  await user.save();
  res.send({ success: true, data: user });
  // Soft delete user
  router.delete("/:id", async function (req, res, next) {
    let user = await users.findById(req.params.id);
    if (!user || user.isDelete)
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    user.isDelete = true;
    await user.save();
    res.send({ success: true, message: "User soft deleted" });
  });
  // POST: verify email and username, set status true
  router.post("/verify", async function (req, res, next) {
    const { email, username } = req.body;
    if (!email || !username)
      return res
        .status(400)
        .send({ success: false, message: "Missing email or username" });
    let user = await users.findOne({ email, username, isDelete: false });
    if (!user)
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    user.status = true;
    await user.save();
    res.send({ success: true, message: "User verified", data: user });
  });
});

module.exports = router;
