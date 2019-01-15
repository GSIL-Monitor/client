const axios = require('axios') 
const axiosInstance = axios.create({
    baseURL: '',
    timeout: 5000,
});


module.exports = axiosInstance;