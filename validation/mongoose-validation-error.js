/**
 * Custom error class handling mongoose validation errors
 * @author  Jannik Portz
 */

const HTTPError = require("./http-error");

class MongooseValidationError extends HTTPError {

    /**
     * Constructor of MongooseValidationError
     * @param   {MongooseError} err     The error coming from mongoose
     */
    constructor(err) {
        const errKeys = Object.keys(err.errors);

        let errorMessage = err.message;
        if (errKeys.length > 0) {
            const firstErr = err.errors[errKeys[0]];
            switch (firstErr.kind) {
                case "Number":
                    errorMessage = `${firstErr.path} must be a valid number`;
                    break;

                case "required":
                    errorMessage = `${firstErr.path} is required`;
                    break;

                case "min":
                    errorMessage = `${firstErr.path} must not be less than ${firstErr.properties.min}`;
                    break;

                case "max":
                    errorMessage = `${firstErr.path} must not be greater than ${firstErr.properties.max}`;
                    break;

                case "ObjectID":
                    errorMessage = 'You must not specify an _id';
                    break;
            }
        }

        super(errorMessage, 400);
    }
}

module.exports = MongooseValidationError;