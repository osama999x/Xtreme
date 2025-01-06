const axios = require('axios');
require('dotenv').config();

const CALENDLY_API_KEY = process.env.CALENDLY_API_KEY;

const calendlyApi = axios.create({
    baseURL: 'https://api.calendly.com/',
    headers: {
        Authorization: `Bearer ${CALENDLY_API_KEY}`,
        'Content-Type': 'application/json',
    },
});

console.log('CALENDLY_API_KEY', CALENDLY_API_KEY);
console.log('calendlyApi', calendlyApi);
module.exports = calendlyApi;
