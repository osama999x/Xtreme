const AppError = require("../utils/appError");

// Middleware to handle errors
const errorHandler = (err, req, res, next) => {
    console.log("ERR CAUGHT IN GLOBAL MIDDLEWARE");
    console.error("ERROR =>", err);
    console.error("ERROR MESSAGE =>", err.message);

    // Handle Mongoose duplicate key errors
    const handleDuplicateFieldsDB = (err) => {
        const field = Object.keys(err.keyValue)[0];
        return new AppError(`${field} already exists`, 400);
    };

    // Handle Mongoose validation errors
    const handleValidationError = (err) => {
        const errors = Object.values(err.errors).map((val) => val.message);
        return new AppError(errors.join(', '), 400);
    };

    // Handle Mongoose Cast Errors (e.g., ObjectId casting errors)
    const handleCastError = (err) => {
        const message = `Invalid ${err.path}: ${err.value}`;
        return new AppError(message, 400);
    };

    // Default error object to return
    const errorResponse = {
        status: "error",
        message: "Internal Server Error",
    };

    // Error handling based on the type of error
    if (err.name === "MongoServerError" && err.code === 11000) {
        err = handleDuplicateFieldsDB(err);
    } else if (err.name === "ValidationError") {
        err = handleValidationError(err);
    } else if (err.name === "CastError") {
        err = handleCastError(err);
    } else {
        err = new AppError(err.message || "An unexpected error occurred", 500);
    }

    // Prepare and send the error response
    return res.status(err.statusCode || 500).json({
        status: "error",
        message: err.message,
    });
};

module.exports = errorHandler;
