/**
 * Defines a HTTPError constructor.
 *
 * @author Jannik Portz
 */
class HTTPError extends Error {

    static get Error500 () {
        return new HTTPError('Internal Server Error', 500);
    };

    static get Error404 () {
        return new HTTPError('Resource does not exist', 404);
    }

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