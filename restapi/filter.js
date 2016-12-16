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
            filter: [],
            offset: 0,
            limit: -1
        };

        // Set filterParams.filter to array of specified attributes
        if (req.query.hasOwnProperty('filter')) {
            filterParams.filter = req.query.filter.split(',').map(s => s.trim());
            for (let i = 0; i < filterParams.filter.length; ++i) {
                if (availableKeys.indexOf(filterParams.filter[i]) < 0) {
                    return next(new HTTPError(`key ${filterParams.filter[i]} does not exist.`, 400));
                }
            }
        }

        // Parse and validate offset
        if (req.query.hasOwnProperty('offset')) {
            filterParams.offset = parseInt(req.query.offset);
            if(isNaN(filterParams.offset) || filterParams.offset < 0){
                return next(new HTTPError('Offset must be a number >= 0', 400));
            }
        }

        // Parse and validate limit
        if (req.query.hasOwnProperty('limit')) {
            filterParams.limit = parseInt(req.query.limit);
            if(isNaN(filterParams.limit) || filterParams.limit <= 0) {
                return next(new HTTPError('Limit must be a number > 0', 400));
            }
        }

        res.locals.filterParams = filterParams;
        next();
    };
};

/**
 * Middleware actually filtering the response data according to the filterParams
 * @inheritDoc
 */
const filterResponseData = (req, res, next) => {
    if (!res.locals.items) {
        next();
        return;
    }

    const filterParams = res.locals.filterParams;
    let data = res.locals.items;
    const isSingle = !Array.isArray(data);

    // Filter
    if (filterParams.filter && filterParams.filter.length > 0) {
        const filterObject = (obj) => {
            const newItem = {};
            filterParams.filter.forEach(key => newItem[key] = obj[key]);
            return newItem;
        };

        data = isSingle ? filterObject(data) : data.map(filterObject);
    }

    // Offset and Limit only for collections
    if (!isSingle) {
        if (filterParams.offset >= data.length && data.length > 0) {
            return next(new HTTPError('Offset must not be greater than the number of available items.', 400));
        }

        // Calculate start and end index of elements to serve in response and create a new array containing only the desired items
        const limit = filterParams.limit > -1 ? filterParams.offset + filterParams.limit : data.length;
        data = data.slice(filterParams.offset, limit);
    }

    res.locals.items = data;
    next();
};

module.exports = {filterParserFactory, filterResponseData};
