/**
 * Creates a middleware function parsing and validating the search query
 * @param       {object}    keyMapping      Object mapping available key to type
 * @returns     {Function}                  Middleware handler
 */
const searchParserFactory = (keyMapping) => {
    // Array of query keys that are also allowed
    const supplementalValidQueryParams = ['offset', 'limit'];

    return (req, res, next) => {
        const search = {};
        const query = req.query;
        for (let key in query) {
            if (!query.hasOwnProperty(key) || supplementalValidQueryParams.indexOf(key) > -1) {
                continue;
            }

            if (!keyMapping.hasOwnProperty(key)) {
                const err = new Error(`Property ${key} does not exist in this resource`);
                err.status = 400;
                next(err);
                return;
            }

            search[key] = query[key];
        }

        if (!res.locals.filterParams) {
            res.locals.filterParams = {};
        }

        res.locals.filterParams.search = search;
        next();
    };
};

/**
 * Creates a middleware function filtering the response items according to search criteria
 * @param       {object}    keyMapping  Object mapping available key to type
 * @returns     {Function}              Middleware handler
 */
const searchResponseFilterFactory = (keyMapping) => {
    return (req, res, next) => {
        // Only search if search criteria is specified and the response data contains an array of items
        if (!res.locals.filterParams || !res.locals.filterParams.search || !res.locals.items || !Array.isArray(res.locals.items)) {
            next();
            return;
        }

        const search = res.locals.filterParams.search;

        /**
         * Checks whether an object matches the search criteria
         * @param       {object}    object      The object to be checked
         * @returns     {boolean}               Whether the object matches the search criteria
         */
        const objectMatchesCriteria = (object) => {
            for (let key in search) {
                if (!search.hasOwnProperty(key)) {
                    continue;
                }

                if (!object.hasOwnProperty(key)) {
                    return false;
                }

                if (keyMapping[key] === 'number' && object[key] !== search[key]) {
                    return false;
                }

                if (keyMapping[key] === 'string' && object[key].indexOf(search[key]) < 0) {
                    return false;
                }
            }

            return true;
        };

        // Filter out items not matching the criteria
        res.locals.items = res.locals.items.filter(objectMatchesCriteria);
        next();
    };
};

module.exports = {searchParserFactory, searchResponseFilterFactory};