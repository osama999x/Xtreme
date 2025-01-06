const NutritionAndExerciseHabitsService = require('./nutritionAndExerciseServices');

class NutritionAndExerciseHabitsController {
    async create(req, res) {
        try {
            const data = req.body;
            const result = await NutritionAndExerciseHabitsService.create(data);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({ message: 'Error creating Nutrition & Exercise Habits', error });
        }
    }

    async getByClientId(req, res) {
        try {
            const { clientId } = req.params;
            const result = await NutritionAndExerciseHabitsService.getByClientId(clientId);
            if (!result) {
                return res.status(404).json({ message: 'No record found for the specified client' });
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching Nutrition & Exercise Habits', error });
        }
    }

    async update(req, res) {
        try {
            const { clientId } = req.params;
            const data = req.body;
            const result = await NutritionAndExerciseHabitsService.update(clientId, data);
            if (!result) {
                return res.status(404).json({ message: 'No record found to update' });
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: 'Error updating Nutrition & Exercise Habits', error });
        }
    }

    async delete(req, res) {
        try {
            const { clientId } = req.params;
            const result = await NutritionAndExerciseHabitsService.delete(clientId);
            if (!result) {
                return res.status(404).json({ message: 'No record found to delete' });
            }
            return res.status(200).json({ message: 'Record deleted successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Error deleting Nutrition & Exercise Habits', error });
        }
    }
}

module.exports = new NutritionAndExerciseHabitsController();
