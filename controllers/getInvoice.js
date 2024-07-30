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

module.exports={
    async invoice(req, res){
       try {
        const id = req.params.id
           const tokenBling = await getTokenBling();
           if (!tokenBling) {
               return res.status(500).json({ error: 'Failed to obtain token' });
           }

           const data = await nota(id, tokenBling)

           res.status(200).json(data)
        
       } catch (error) {
          res.status(500).josn(error)
       }
    }
}