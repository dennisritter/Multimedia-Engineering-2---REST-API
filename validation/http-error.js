/**
 * Defines a HTTPError constructor.
 *
 * @author Jannik Portz
 */
class HTTPError extends Error {

    /**
     * The constructor
     * @param message - The error message
     * @param status - The HTTP status code
     */
    constructor (message, status) {
        super(message);
        this.status = status || 500;
    }
}

module.exports = HTTPError;