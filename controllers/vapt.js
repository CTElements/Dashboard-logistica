
const axios = require('axios');
const qs = require('qs');
module.exports = {
    async vapt(req, res){

       try {
           const loginUrl = 'http://localhost/vector-api/app/vapt/login';
           const getHeadsUrl = 'http://localhost/vector-api/app/vapt/get-order-elements';

           const loginData = {
               username: '759',
               password: 'X0i#7W4}IPSWjHQqc+04'
           };

           axios.post(loginUrl, qs.stringify(loginData), {
               headers: {
                   'Content-Type': 'application/x-www-form-urlencoded'
               }
           })
               .then(response => {
                   return res.status(200).json(response.data)
                  
                   const responseData = response.data;

                   if (responseData.token) {
                       const token = responseData.token;
                       console.log("Token JWT:", token);
                       return axios.get(getHeadsUrl, {
                           headers: {
                               Authorization: `Bearer ${token}`
                           }
                       });
                   } else {
                       throw new Error('Resposta inesperada');
                   }
               })
               .then(response => {
                   console.log("Resposta do servidor:", response.data);
               })
               .catch(error => {
                   res.status(500).json(error.cause)
               });

       } catch (error) {
         res.status(500).json(error)
       }

    } 
}

