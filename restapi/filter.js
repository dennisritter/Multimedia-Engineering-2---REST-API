const {allKeys} = require('./../validators/videos.js');

/**
 * Middleware parsing the filter params specified in the Query string.
 * Creates a filterParams object and attached it to res.locals
 * @inheritDoc
 */
const filterParser = (req, res, next) => {
    // Default params
    const filterParams = {
        filter: [],
        offset: 0,
        limit: -1
    };

    // Set filterParams.filter to array of specified attributes
    if (req.query.hasOwnProperty('filter')) {
        filterParams.filter = req.query.filter.split(',').map(s => s.trim());
        for (let i = 0; i < filterParams.filter; ++i) {
            if (!allKeys.hasOwnProperty(key)) {
                const err = new Error(`key not valid`);
                err.status = 400;
                next(err);
                return;
            }
        }
    }

    // Parse and validate offset
    if (req.query.hasOwnProperty('offset')) {
        filterParams.offset = parseInt(req.query.offset);
        if(isNaN(filterParams.offset) || filterParams.offset < 0){
            const err = new Error(`Offset must be a number >= 0`);
            err.status = 400;
            next(err);
            return;
        }

    }

    // Parse and validate limit
    if (req.query.hasOwnProperty('limit')) {
        filterParams.limit = parseInt(req.query.limit);
        if(isNaN(filterParams.limit) || filterParams.limit <= 0){
            const err = new Error(`Limit must be a number > 0`);
            err.status = 400;
            next(err);
            return;
        }
    }

    res.locals.filterParams = filterParams;
    next();
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
    let data = res.locals.data;
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
        if (filterParams.offset >= data.length) {
            const err = new Error(`Offset must not be greater than the number of available items items`);
            err.status = 400;
            next(err);
            return;
        }

        // Calculate start and end index of elements to serve in response and create a new array containing only the desired items
        const limit = filterParams.limit > -1 ? filterParams.offset + filterParams.limit : data.length;
        data = data.slice(filterParams.offset, limit);
    }

    res.locals.items = data;
    next();
};

module.exports = {filterParser, filterResponseData};
