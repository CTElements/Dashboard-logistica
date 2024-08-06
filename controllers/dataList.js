const axios = require('axios');
const vandemmia_token = require('./vandemmiaToken')
const qs = require('qs');

async function invoices(data, token) {
    const { page, limit, orderId, status, serie, dateStart, dateEnd } = data;
    try {
        const link = `https://www.bling.com.br/Api/v3/nfe?pagina=${page}&limite=${limit}${orderId ? `&numeroLoja=${orderId}` : ''}&situacao=${status}&tipo=${serie}&dataEmissaoInicial=${dateStart}&dataEmissaoFinal=${dateEnd}`
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

async function invoice(id, token) {
    try {
        const response = await axios.get(`https://bling.com.br/Api/v3/nfe/${id}`, {
            headers: {
                "Authorization": `Bearer ${token.token}`
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
}



function setDate(getYear, month, dayOfMonth) {
     
    return `${Number(getYear)}-${month}-${dayOfMonth}`;
}

function setDateStart(getYear, month, dayOfMonth) {
    return encodeURIComponent(`${setDate(getYear, month, dayOfMonth)} 00:00:00`);
}

function setDateEnd(getYear, month, dayOfMonth) {
    return encodeURIComponent(`${setDate(getYear, month, dayOfMonth)} 23:59:59`);
}



async function getTokenBling() {
    try {
        const response = await axios.post('https://bling-refresh-token.vercel.app/token');
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function movvi(id) {
    try {
        const response = await axios.post('https://usointerno.movvi.com.br/api/api-conhecimentos-embarcados-movvi/nota', {
            "TOKEN": process.env.MOVVITOKEN,
            "CNPJ_EMBARCADOR": "25098466000100",
            "NOTA_FISCAL": id,
            "SERIE": "1"
        }, {
            headers: { accept: 'application/json', 'content-type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

async function vaptData(data){
    try {
        var start_date = data.dateStart
        var end_date = data.dateEnd
        var limit = data.limit
        var page = data.page
        const loginUrl = 'https://vector.log.br/api/app/vapt/login';
        const getHeadsUrl = `https://vector.log.br/api/app/vapt/get-order-elements-novo?start_date=${start_date}&end_date=${end_date}&page=${page}&per_page=${limit}`;
        const loginData = {
            username: '759',
            password: 'X0i#7W4}IPSWjHQqc+04'
        };
        const response = await axios.post(loginUrl, qs.stringify(loginData), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        const token = response.data.token
        const responseData = await axios.get(getHeadsUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
       return responseData.data

    } catch (error) {
        return false
    }
}

async function notaVandemmia(token, data) {
    try {
        const response = await axios.get(`https://api.vendemmia.com.br/pickingepacking/list?startsAt=${data.dateStart}&endsAt=${data.dateEnd}&status[]=IMPORTADO&status[]=SEPARACAO&status[]=CONFERENCIA&status[]=ENVIADO_PARA_FATURAMENTO&status[]=FATURADO&status[]=COLETA_INICIADA&status[]=OUTROS&status[]=CANCELADO&status[]=GERADA_COM_CORTE&type_storage=picking&page=${data.page}&&page_size=${data.limit}`, {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'Authorization': `bearer ${token.token}`,
            }
        });
        return response.data.data;
    } catch (error) {
        return 'null';
    }
}


async function shippingCompany(dataList, vandemmia, vaptOparetor){
    if (!vaptOparetor) return dataList.shipping_company = 'Vendemmia';
   
    switch (vandemmia && dataList.operator?.nomeTransportadora) {
        case 'MOVVI LOGISTICA LTDA':
          
            dataList.shipping_company = 'Movvi';
        break;
        case 'EXPRESSO SAO MIGUEL S/A':
            dataList.shipping_company = 'Expresso São Miguel';
            break;
        case 'POSTALES SERVICOS POSTAIS LTDA': // correios
            dataList.shipping_company = 'Postales';
            break;
        case 'MERCADO LIVRE':
            dataList.shipping_company = 'Mercado Livre';
            break;

        case 'DBA-AMAZON':
            dataList.shipping_company = 'Amazon';
            break;

        case 'JAMEF TRANSPORTES EIRELI':
            dataList.shipping_company = 'Jamef';
            break;

        case 'COMSIL EXPRESS TRANSP EIRELI':
            dataList.shipping_company = 'Comsil';
            break;
        case 'FL BRASIL HOLDING, LOGISTICA E TRANSPORTE LTDA': // solistica
            dataList.shipping_company = 'Solistica';
            break;
        case 'VALDELIR FREDERICO CARDOSO':
            dataList.shipping_company = 'Valdelir Frederico';
            break;
    default:
            dataList.shipping_company = dataList.operator?.nomeTransportadora;
        break;
  }
}



const operatorFilter = {
    "null":0,
    "Vendemmia":1,
    "VAPT":2
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

var canal={
    "0":"Nenhuma",
    "204332822": "Mercado Livre",
    "204365610": "Amazon",
    "204373003": "Americanas",
    "204313141": "B2B2C",
    "204315148": "B2C-CORP.",
    "204322956": "Bonificação (Outros)",
    "204332812": "E-commerce",
    "204318533": "Elements Shopify",
    "203901744": "Elements Tray",
    "204310486": "Garantia",
    "204370924": "Kabum",
    "204370925": "Leroy Merlim",
    "204370928": "MadeiraMadeira",
    "204370918": "Magazine Luiza",
    "204370929": "Olist",
    "204337940": "Open BOX (DEV 7 DIAS)",
    "204311925": "Parceiros",
    "204337947": "Peças de reposição",
    "204310575": "Venda Interna",
    "204051989": "Vendas B2B (Itajai)",
    "204346781": "Vendas Palhoça",
    "204496694": "Vendas São Paulo",
    "204370932": "Via Varejo",
    "204359790": "Westwing",
}


module.exports = {
    async dataList(req, res) {
        try { 
            const data_body = req.body
            const tokenBling = await getTokenBling();
            const tokenVandemmia = await vandemmia_token()
            if (!tokenBling) {
                return res.status(500).json({ error: 'Failed to obtain token' });
            }

            const data = {
                page: data_body.page,
                limit: data_body.limit,
                orderId: undefined,
                status: data_body.invoiceStatusValue,
                serie: 1,
                dateStart: setDateStart(data_body.startDate.year, data_body.startDate.month, data_body.startDate.day),
                dateEnd: setDateEnd(data_body.endDate.year, data_body.endDate.month, data_body.endDate.day),
                operatorValue: operatorFilter[data_body.operatorValue],
                shippingCompanyValue: data_body.shippingCompanyValue
            };

           
            const invoiceBling = await invoices(data, tokenBling);   
            if (invoiceBling.error) {
                return res.status(500).json({ error: 'Failed to fetch invoices' });
            }

            const vandemmia_data = await notaVandemmia(tokenVandemmia, data);
            const vapt_data = await vaptData(data)
            
            console.log(tokenBling)
            const listInvoicePromises = invoiceBling?.map(async (invoice) => {
                var numero = invoice.numero.slice(1).toString()
                var vandemmia = vandemmia_data.find(e => e.noteNumber == numero)
                var vaptOparetor = vapt_data.find(e => e.nfe_number == numero)
                
                var operator = vandemmia ? vandemmia : vaptOparetor ? vaptOparetor : { updatedAtFormatted: invoice.dataEmissao, statusNf: statusTypeInvoice[data_body.invoiceStatusValue] }
                const dataList = {
                    invoice,
                    operator: operator,
                    shipping_company: null,
                    operator_name: vaptOparetor ? 'VAPT' :'Vendemmia',
                    region: regions[invoice.contato.endereco.uf],
                    situacao: statusTypeInvoice[invoice.situacao],
                    canal: canal[invoice.loja.id] ?? "Nenhuma"
                };
                await shippingCompany(dataList, vandemmia, vaptOparetor)
                return dataList;
            });
            var listInvoice = await Promise.all(listInvoicePromises);
            if (data.operatorValue == 1){
                listInvoice = listInvoice.filter(e => e.operator_name == 'Vendemmia')
            }
            if (data.operatorValue == 2) {
                listInvoice = listInvoice.filter(e => e.operator_name == 'VAPT')
            }
            if (data.shippingCompanyValue !== null) {
                listInvoice = listInvoice.filter(e => e.shipping_company == data.shippingCompanyValue)
            }
            res.status(200).json(listInvoice);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

