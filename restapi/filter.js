const {requiredKeys, optionalKeys, internalKeys, allKeys} = require('./../validators/videos.js');

const filterParser = function(req, res, next){
    "use strict";

    const filterParams = {
        filter: [],
        offset: 0,
        limit: -1
    };

    // const allowedFilter = ['filter', 'limit', 'offset'];
    //
    // Object.keys(req.query).forEach(key => {
    //     if(allowedFilter.indexOf(key) < 0){
    //         const err = new Error('filter not valid');
    //         err.status = 400;
    //         next(err);
    //         return;
    //     }
    // });

    if (req.query.hasOwnProperty('filter')) {
        filterParams.filter = req.query.filter.split(',').map(s => s.trim());
        filterParams.filter.forEach(key => {
            if(!allKeys.hasOwnProperty(key)){
                const err = new Error(`key not valid`);
                err.status = 400;
                next(err);
                // TODO: actually return from middleware and not from forEach callback
                return;
            }
        });
    }

    if (req.query.hasOwnProperty('offset')) {
        filterParams.offset = parseInt(req.query.offset);
        if(isNaN(filterParams.offset) || filterParams.offset < 0){
            const err = new Error(`Offset must be a number >= 0`);
            err.status = 400;
            next(err);
            return;
        }

    }

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

const filterResponseData = (req, res, next) => {
    if (!res.locals.items) {
        next();
        return;
    }

    const filterParams = res.locals.filterParams;
    const isSingle = !Array.isArray(res.locals.items);

    // Always operate with array to keep it simple
    let items = isSingle ? [res.locals.items] : res.locals.items;
    // TODO: maybe create deep copy?

    // Filter
    if (filterParams.filter && filterParams.filter.length > 0) {
        items = items.map((item) => {
            const newItem = {};
            filterParams.filter.forEach(key => newItem[key] = item[key] || null);
            return newItem;
        });
    }

    // Offset and Limit only for collections
    if (!isSingle) {
        if (filterParams.offset >= items.length) {
            const err = new Error(`Offset must not be greater than the number of available items items`);
            err.status = 400;
            next(err);
            return;
        }

        // Calculate start and end index of elements to serve in response and create a new array containing only the desired items
        const limit = filterParams.limit > -1 ? filterParams.offset + filterParams.limit : items.length;
        items = items.slice(filterParams.offset, limit);
    }

    if (isSingle) {
        items = items[0];
    }

    res.locals.items = items;
    next();
};

module.exports = {filterParser, filterResponseData};
