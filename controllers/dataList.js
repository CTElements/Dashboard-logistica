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

async function vaptData(){
    try {
        const loginUrl = 'https://vector.log.br/api/app/vapt/login';
        const getHeadsUrl = 'https://vector.log.br/api/app/vapt/get-order-elements';
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

async function shippingCompany(dataList){
    var shippingCompanyName = dataList.operator?.nomeTransportadora
    switch (dataList.operator && dataList.operator?.nomeTransportadora) {
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
            dataList.shipping_company = 'VAPT';
        break;
  }
}



const operatorFilter = {
    "null":0,
    "Vendemmia":1,
    "VAPT":2
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

            const invoiceBling = await invoices(data, tokenBling);
            if (invoiceBling.error) {
                return res.status(500).json({ error: 'Failed to fetch invoices' });
            }
   
            const vandemmia_data = await notaVandemmia(tokenVandemmia, data);
            //const vapt_data = await vaptData()
            //const vaptDateStart = data_body.startDate.year + "-" + data_body.startDate.month + "-" + data_body.startDate.day +"T00:00:00"
            //const vaptDateEnd = data_body.endDate.year + "-" + data_body.endDate.month + "-" + data_body.endDate.day + "T23:59:59"
            //const newDataVapt = vapt_data.filter(e => new Date(e.order_date) >= new Date(vaptDateStart) && new Date(e.order_date) <= new Date(vaptDateEnd));

            const listInvoicePromises = invoiceBling?.map(async (invoice) => {
                var numero = invoice.numero.slice(1).toString()
                var vandemmia = vandemmia_data.find(e => e.noteNumber == numero)
                var operator = vandemmia ?? { updatedAtFormatted: invoice.dataEmissao, statusNf: statusTypeInvoice[data_body.invoiceStatusValue] }
                const dataList = {
                    invoice,
                    operator: operator,
                    shipping_company: 'null',
                    operator_name: vandemmia ? 'Vendemmia':'VAPT'
                };
                await shippingCompany(dataList)
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

//time curl --get http://localhost:3000/api
