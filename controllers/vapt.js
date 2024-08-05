
const axios = require('axios');
const qs = require('qs');

module.exports = {
    async vapt(req, res){

       try {
           const loginUrl = 'https://vector.log.br/api/app/vapt/login';
           const getHeadsUrl = 'https://vector.log.br/api/app/vapt/get-order-elements-novo?start_date=2024-08-01%2000%3A00%3A00&end_date=2024-08-02%2000%3A00%3A00&page=1&per_page=100';
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
           res.status(200).json(responseData.data)
        
       } catch (error) {
         res.status(500).json(error)
       }

    } 
}

