const {requiredKeys, optionalKeys, internalKeys, allKeys} = require('./../validators/videos.js');

const filterParser = function(req, res, next){
    "use strict";

    const filterParams = {};
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

    if(req.query.hasOwnProperty('filter')){
        filterParams.filter = req.query.filter.split(',').map(s => s.trim());
        filterParams.filter.forEach(key => {
            if(!allKeys.hasOwnProperty(key)){
                const err = new Error(`key not valid`);
                err.status = 400;
                next(err);
                return;
            }
        });

    }

    if(req.query.hasOwnProperty('offset')){
        filterParams.offset = parseInt(req.query.offset);
        if(isNaN(filterParams.offset) || filterParams.offset < 0){
            const err = new Error(`Offset must be a number >= 0`);
            err.status = 400;
            next(err);
            return;
        }

    }

    if(req.query.hasOwnProperty('limit')){
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

module.exports = {filterParser};
