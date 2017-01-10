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
        const getErrorMessage = (err) => {
            switch (err.kind) {
                case "Number":
                case "number":
                    return `${err.path} must be a valid number`;

                case "required":
                    return `${err.path} is required`;

                case "min":
                    return `${err.path} must not be less than ${err.properties.min}`;

                case "max":
                    return `${err.path} must not be greater than ${err.properties.max}`;

                case "ObjectID":
                    return '_id is not a valid id';

                default:
                    return err.message;
            }
        };

        const errorMessage = err.errors
            ? getErrorMessage(err.errors[Object.keys(err.errors)[0]])
            : getErrorMessage(err);

        super(errorMessage, 400);
    }
}

module.exports = MongooseValidationError;