const express = require('express')
const router = express.Router()
const User = require("../model/user");
const controller = require("../controller/user.controller")

router.post("/register",controller.register)

router.patch("/updateuser/:id",controller.updateuser)

router.delete("/deleteuser/:id",controller.deleteuser)

router.get('/rewards', controller.getUserRewards);

router.get('/dashboard', controller.getUserDashboard);





module.exports = router