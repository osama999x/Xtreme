const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();
const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID');

exports.verifyGoogleToken = async (token) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            profilePicture: payload.picture,
        };
    } catch (error) {
        console.error('Error verifying Google Token:', error);
        throw new Error('Invalid Google Token');
    }
};
