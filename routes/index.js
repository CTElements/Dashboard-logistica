const express = require("express");
const router = express.Router();
const dataList = require("../controllers/dataList")
const vapt = require('../controllers/vapt')

router.post('/api', dataList.dataList )
router.get('/vapt', vapt.vapt)

router.get('/', (req, res) => {
   // res.status(200).json({status: 200, msg: "app running"})
   var name ='nelson'
   res.render('index',{ name })
})
module.exports = router
