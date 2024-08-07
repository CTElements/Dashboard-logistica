
const axios = require('axios')

function filterTranportName(data) {
    if (!data?.transporte) return false
    var status = {
        status: false,
        name: data?.transporte.transportadora,
        alias: data?.transporte.transportadora,
        operator: null
    }
    var list = ['movvi', 'expresso', 'postales', 'mercado livre', 'amazon', 'jamef', 'comsil', 'fl brasil holding', 'valdelir frederico', 'vapt']
    var name = data?.transporte.transportadora.toLowerCase()
    list.forEach((text) => {
        if (name.includes(text)) {
            status = {
                status: true,
                name: data?.transporte.transportadora,
                alias: text,
                operator: text == 'vapt' ? 'vapt' : 'vendemmia'
            }
        }
    })
    return status
}
async function sendDataForVapt( res, data, operator){
    return res.status(200).json({ operator: operator, data })
}
async function sendDataForVendemmia(res, data, operator) {
    return res.status(200).json({ operator: operator, data })
}
module.exports = {
 async sendXML(req, res){
    try {
        const data = req.body
        const situacao = data.retorno.notasfiscais[0].notafiscal.situacao
        if(situacao !== 'Emitida DANFE'){
            return res.status(200).json({ status: 200, situacao: situacao })
        }
        var operatorData = filterTranportName(data.retorno.notasfiscais[0].notafiscal)
        if (!operatorData && !operatorData.status){
            return res.status(200).json({ status: 200, msg:"Operator not exist" })
        }
        if (operatorData.operator == 'vapt') return sendDataForVapt(res, data, operatorData.operator)
        if (operatorData.operator == 'vendemmia') return sendDataForVendemmia(res, data, operatorData.operator)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(200).json(error)
    }
 }
}