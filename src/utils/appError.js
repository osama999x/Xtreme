class AppError extends Error {
    constructor(message, statusCode, isOperational = false, stack = "") {
        console.log("AppError =>", message);
        console.log("AppError =>", statusCode);
        console.log("AppError =>", isOperational);
        console.log("AppError =>", stack);

        super(message); // Call the parent class constructor
        this.statusCode = statusCode; // Set the status code
        this.isOperational = isOperational; // Set operational status
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"; // Determine status based on code

        // Capture stack trace unless one is provided
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = AppError;
