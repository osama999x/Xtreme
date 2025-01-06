// subscriptionService.js
const { Subscription } = require('./subscriptionModel');

const createSubscription = async (data) => {
    return await Subscription.create(data);
};

const getSubscriptions = async (clientId) => {
    return await Subscription.find(clientId ? { clientId } : {}).populate('clientId');
};

const getSubscriptionById = async (id) => {
    return await Subscription.findById(id);
};
const getSubscriptionByClientId = async (id) => {
    // console.log('ClientId', id);
    return await Subscription.find({ clientId: id }).populate('clientId');
};


const updateSubscription = async (id, data) => {
    return await Subscription.findByIdAndUpdate(id, data, { new: true });
};

const findActiveSubscription = async (clientId) => {
    const now = new Date();
    return await Subscription.findOne({
        clientId,
        expirationDate: { $gte: now },
    });
};


const deleteSubscription = async (id) => {
    return await Subscription.findByIdAndDelete(id);
};

module.exports = {
    createSubscription,
    findActiveSubscription,
    getSubscriptions,
    getSubscriptionById,
    getSubscriptionByClientId,
    updateSubscription,
    deleteSubscription,
};
