class CustomError extends Error {
    constructor(message, options = { statusCode: 400, showToUser: true }) {
        super(message);
        this.name = 'CustomError';
        this.statusCode = options.statusCode || 400; // HTTP status code for error
        this.showToUser = options.showToUser; // Indicates if the error should be shown to the user
    }
}

module.exports = CustomError;
