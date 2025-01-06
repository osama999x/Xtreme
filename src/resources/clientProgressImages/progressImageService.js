const ProgressImage = require('./progressImageModel');
const uploadFile = require('../../utils/uploadFile');

const progressImageService = {
    uploadImages: async (clientId, images) => {
        const savedImages = await Promise.all(
            images.map(async (image) => {
                const imagePath = await uploadFile(image.fileData);
                return { url: imagePath, description: image.description, uploadedAt: new Date() };
            })
        );

        const progressImageDoc = await ProgressImage.findOneAndUpdate(
            { clientId },
            { $push: { images: { $each: savedImages } } },
            { upsert: true, new: true }
        );
        return progressImageDoc;
    },

    getImages: async (clientId, date, week) => {
        let filter = { clientId };

        if (date) {
            const targetDate = new Date(date);
            filter['images.uploadedAt'] = {
                $gte: targetDate,
                $lt: new Date(targetDate.setDate(targetDate.getDate() + 1)),
            };
        }

        if (week) {
            const startDate = new Date(week);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
            filter['images.uploadedAt'] = { $gte: startDate, $lt: endDate };
        }

        const images = await ProgressImage.find(filter, 'images').exec();
        return images;
    },
};

module.exports = progressImageService;
