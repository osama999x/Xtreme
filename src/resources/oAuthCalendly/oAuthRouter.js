// oauthRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Step 1: Redirect user to Calendly's OAuth page
router.get('/authorize', (req, res) => {
    const redirectUri = encodeURIComponent(process.env.CALENDLY_REDIRECT_URI);
    const clientId = process.env.CALENDLY_CLIENT_ID;
    console.log("clientId", clientId, "   redirectUri", redirectUri);
    // Redirect to Calendly OAuth authorization page
    res.redirect(`https://calendly.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`);
});

// Step 2: Handle OAuth callback and exchange code for access token
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('No authorization code received');
    }

    try {
        const response = await axios.post('https://calendly.com/oauth/token', null, {
            params: {
                client_id: process.env.CALENDLY_CLIENT_ID,
                client_secret: process.env.CALENDLY_CLIENT_SECRET,
                redirect_uri: process.env.CALENDLY_REDIRECT_URI,
                code,
                grant_type: 'authorization_code'
            },
        });

        const { access_token } = response.data;

        // Save access token securely (you could store this in the database)
        process.env.CALENDLY_API_KEY = access_token;

        res.send('Successfully authorized with Calendly. You can now create meetings!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during OAuth authorization');
    }
});

module.exports = router;
