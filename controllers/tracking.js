
const axios = require('axios');
async function getTokenBling() {
    try {
        const response = await axios.post('https://bling-refresh-token.vercel.app/token');
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}
async function getUser(text, token) {
    try {
        const response = await axios.get(`https://bling.com.br/Api/v3/contatos?numeroDocumento=${text}`, {
            headers: {
                "Authorization": `Bearer ${token.token}`
            }
        });
        if (response.data?.data && response.data.data.length > 0){
            return response.data;
        }
    } catch (error) {
        //console.log(error)
        return false;
    }
}
async function getOrder(id, token) {
    try {
        const response = await axios.get(`https://bling.com.br/Api/v3/pedidos/vendas?idContato=${id}`, {
            headers: {
                "Authorization": `Bearer ${token.token}`
            }
        });
        if (response.data?.data && response.data.data.length > 0) {
            return response.data;
        }
    } catch (error) {
        console.log(error)
        return false;
    }
}
async function getInvoices(id, token) {
    try {
        const response = await axios.get(`https://bling.com.br/Api/v3/nfe?pagina=1&limite=100&numeroLoja=${id}`, {
            headers: {
                "Authorization": `Bearer ${token.token}`
            }
        });
        if (response.data?.data && response.data.data.length > 0) {
            return response.data;
        }
    } catch (error) {
       // console.log(error)
        return false;
    }
}

async function getInvoice(id, token) {
    try {
        const response = await axios.get(`https://bling.com.br/Api/v3/nfe/${id}`, {
            headers: {
                "Authorization": `Bearer ${token.token}`
            }
        });
         return response.data?.data;
        
    } catch (error) {
        console.log(error)
        return false;
    }
}

//Isadora Colling
//isadoracolling@hotmail.com
//04392982025
// var text ='Lucas el jaick'

module.exports = {
    async tracking(req, res){
      try {
          const text = req.params.text
          const tokenBling = await getTokenBling();
          const user = await getUser(text, tokenBling)
          if (!user){
             return res.status(200).json({ status: 404, msg: "user not found"})
          }
          var userId = user.data[0].id
          const order = await getOrder(userId, tokenBling)
          if (!order) {
              return res.status(200).json({ status: 404, msg: "order not found" })
          }
          const listInvoicePromises = order.data.map(async(element) => {
              var numeroLoja = element.numeroLoja
              var invoice = await getInvoices(numeroLoja, tokenBling)
              var invoiceId = invoice? invoice.data[0].id: false
              if (invoiceId){
                  return await getInvoice(invoiceId, tokenBling)
              }
          });
          var listInvoice = await Promise.all(listInvoicePromises);
          res.status(200).json(listInvoice)
        
      } catch (error) {
          res.status(500).json(error)
      }
    } 
}