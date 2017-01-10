const HTTPError = require('./../validation/http-error');

/**
 * Creates a middleware handler parsing the filter params to a filterParams object
 * @param       {array}     availableKeys   Array of available keys of the resource collection
 * @returns     {Function}                  Middleware handler
 */
const filterParserFactory = (availableKeys) => {
    return (req, res, next) => {
        // Default params
        const filterParams = {
            filter: "",
            offset: 0,
            limit: 0
        };

        if (req.query.hasOwnProperty('filter')) {
            filterParams.filter = req.query.filter.split(',').map(s => s.trim());
            for (let i = 0; i < filterParams.filter.length; ++i) {
                if (availableKeys.indexOf(filterParams.filter[i]) < 0) {
                    return next(new HTTPError(`key ${filterParams.filter[i]} does not exist.`, 400));
                }
            }

            filterParams.filter = filterParams.filter.toString().replace(/,/g, ' ');
        }

        //Parse and validate offset
        if (req.query.hasOwnProperty('offset')) {
            filterParams.offset = parseInt(req.query.offset);

            if (isNaN(filterParams.offset) || filterParams.offset < 0){
                return next(new HTTPError('Offset must be a number >= 0', 400));
            }
        }

        //Parse and validate limit
        if (req.query.hasOwnProperty('limit')) {
            filterParams.limit = parseInt(req.query.limit);

            if (isNaN(filterParams.limit) || filterParams.limit <= 0) {
                return next(new HTTPError('Limit must be a number > 0', 400));
            }
        }

        res.locals.filterParams = filterParams;
        next();
    };
};

module.exports = {filterParserFactory};
