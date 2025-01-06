const bcrypt = require('bcrypt');
const passwordServices = {
    hash: async (password, salt) => {
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    },
    authenticate: async (password, hash) => {
        const passwordMatch = await bcrypt.compare(password, hash);
        return passwordMatch;
    },
    compare: async (plainPassword, hashedPassword) => {
        try {
            const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
            return isMatch;
        } catch (error) {
            console.error('Error comparing passwords:', error);
            throw new Error('Error comparing passwords');
        }
    }
};

module.exports = passwordServices;
