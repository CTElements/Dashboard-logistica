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

async function nota(id,token) {
    try {
        const link = `https://bling.com.br/Api/v3/nfe/${id}`
        const response = await axios.get(link, {
            headers: {
                "Authorization": `Bearer ${token.token}`
            }
        });
        var notas = response.data.data
        return notas;
    } catch (error) {
        return error;
    }
}

async function naturezas(token) {
    try {
        const response = await axios.get(`https://bling.com.br/Api/v3/naturezas-operacoes?pagina=1&limite=100&situacao=1`, {
            headers: {
                "Authorization": `Bearer ${token.token}`
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
}
async function canalVenda(id, token) {
    try {
        const response = await axios.get(`https://bling.com.br/Api/v3/canais-venda/${id}`, {
            headers: {
                "Authorization": `Bearer ${token.token}`
            }
        });
        return response.data?.data?.descricao;
    } catch (error) {
        return undefined;
    }
}

var regions = {
    "SP": "Sudeste",
    "RJ": "Sudeste",
    "MG": "Sudeste",
    "ES": "Sudeste",
    "RS": "Sul",
    "SC": "Sul",
    "PR": "Sul",
    "BA": "Nordeste",
    "PE": "Nordeste",
    "CE": "Nordeste",
    "RN": "Nordeste",
    "PB": "Nordeste",
    "AL": "Nordeste",
    "SE": "Nordeste",
    "PI": "Nordeste",
    "MA": "Nordeste",
    "PA": "Norte",
    "AM": "Norte",
    "RR": "Norte",
    "AP": "Norte",
    "TO": "Norte",
    "RO": "Norte",
    "AC": "Norte",
    "DF": "Centro-Oeste",
    "GO": "Centro-Oeste",
    "MT": "Centro-Oeste",
    "MS": "Centro-Oeste"
};
var statusTypeInvoice = {
    "1": "Pendente",
    "2": "Cancelada",
    "3": "Aguardando recibo",
    "4": "Rejeitada",
    "5": "Autorizada",
    "6": "Emitida DANFE",
    "7": "Registrada",
    "8": "Aguardando protocolo",
    "9": "Denegada",
    "10": "Consulta situação",
    "11": "Bloqueada",
}


var transportName = {
    "MOVVI LOGISTICA LTDA": "Movvi",
    "EXPRESSO SAO MIGUEL S/A": "Expresso São Miguel",
    "POSTALES SERVICOS POSTAIS LTDA": "Postales",
    "MERCADO LIVRE": "Mercado Livre",
    "DBA-AMAZON": "Amazon",
    "JAMEF TRANSPORTES EIRELI": "Jamef",
    "COMSIL EXPRESS TRANSP EIRELI": "Comsil",
    "FL BRASIL HOLDING, LOGISTICA E TRANSPORTE LTDA": "Solistica",
    "VALDELIR FREDERICO CARDOSO": "Valdelir Frederico",
    "COMSIL EXPRESS TRANSPORTES LTDA":"Comsil"
}

module.exports={
    async invoice(req, res){
       try {
        const id = req.params.id
           const tokenBling = await getTokenBling();
           if (!tokenBling) {
               return res.status(500).json({ error: 'Failed to obtain token' });
           }

           const getNatureza = await naturezas(tokenBling)
           var data_final = {
                invoice: null,
                natureza: null,
                transport: null,
                operator: null,
                region:null,
                situacao: null,
                canal: null,
                shipping_company:null
           }

           const data_invoice = await nota(id, tokenBling)
           const natureza = getNatureza.data.find(e => e.id == data_invoice.naturezaOperacao.id )
           data_final.natureza = natureza
           data_final.invoice = data_invoice
           data_final.region = regions[data_invoice.contato.endereco.uf]
           data_final.situacao = statusTypeInvoice[data_invoice.situacao]
           data_final.canal = await canalVenda(data_invoice.loja.id, tokenBling) ?? "Nenhuma"
           data_final.shipping_company = transportName[data_invoice.transporte.transportador.nome] ?? data_invoice.transporte.transportador.nome

           res.status(200).json(data_final)
        
       } catch (error) {
          res.status(500).json(error)
       }
    }
}