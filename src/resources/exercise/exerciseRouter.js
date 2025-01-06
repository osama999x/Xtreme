const express = require('express');
const {
    createExercise,
    updateExercise,
    getAllExercises,
    getExerciseById,
    deleteExercise
} = require('./exerciseController');

const exerciseRouter = express.Router();

exerciseRouter
    .route('/')
    .post(createExercise)
    .get(getAllExercises);

exerciseRouter
    .route('/:id')
    .get(getExerciseById)
    .put(updateExercise)
    .delete(deleteExercise);

module.exports = exerciseRouter;
