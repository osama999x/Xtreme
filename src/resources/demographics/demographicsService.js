const Demographics = require('./demographicModel');

class DemographicsService {
    async create(data) {
        try {
            const newDemographics = new Demographics(data);
            return await newDemographics.save();
        } catch (error) {
            throw new Error(`Error creating Demographics: ${error.message}`);
        }
    }

    async getByClientId(clientId) {
        try {
            const demographics = await Demographics.findOne({ clientId });
            if (!demographics) {
                throw new Error('No Demographics found for the specified client');
            }
            return demographics;
        } catch (error) {
            throw new Error(`Error fetching Demographics: ${error.message}`);
        }
    }

    async update(clientId, data) {
        try {
            const updatedDemographics = await Demographics.findOneAndUpdate(
                { clientId },
                data,
                { new: true }
            );
            if (!updatedDemographics) {
                throw new Error('No Demographics record found to update');
            }
            return updatedDemographics;
        } catch (error) {
            throw new Error(`Error updating Demographics: ${error.message}`);
        }
    }


    async delete(clientId) {
        try {
            const deletedDemographics = await Demographics.findOneAndDelete({ clientId });
            if (!deletedDemographics) {
                throw new Error('No Demographics record found to delete');
            }
            return deletedDemographics;
        } catch (error) {
            throw new Error(`Error deleting Demographics: ${error.message}`);
        }
    }
}

module.exports = new DemographicsService();
