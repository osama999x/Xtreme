const progressImageService = require('./progressImageService');
const sendResponse = require('../../utils/sendResponse');
const responseStatusCodes = require('../../constants/responseStatusCodes');

const progressImageController = {
    uploadProgressImages: async (req, res) => {
        const { clientId, images } = req.body;

        const savedImages = await progressImageService.uploadImages(clientId, images);
        return sendResponse(
            res,
            responseStatusCodes.CREATED,
            'Progress images uploaded successfully',
            savedImages
        );
    },

    getProgressImages: async (req, res) => {
        const { clientId, date, week } = req.query;

        const images = await progressImageService.getImages(clientId, date, week);
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Progress images retrieved successfully',
            images
        );
    },
};

module.exports = progressImageController;
