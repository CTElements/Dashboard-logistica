const express = require("express");
const router = express.Router();
const dataList = require("../controllers/dataList")
const vapt = require('../controllers/vapt')
const invoice = require('../controllers/getInvoice')
const sendXML = require('../controllers/sendXML')
const tracking = require('../controllers/tracking')

router.get('/tracking/:text', tracking.tracking)
router.post('/sendXML', sendXML.sendXML)
router.post('/api', dataList.dataList )
router.get('/vapt', vapt.vapt)
router.get('/invoice/:id', invoice.invoice)

router.get('/', (req, res) => {
   res.render('index')
})
module.exports = router
