/**
 * Load responses from a directory into a Sails app
 */

var async = require('async');
var _ = require('lodash');
// var buildDictionary = require('sails-build-dictionary');

module.exports = function (sails, dir, cb) {
    // async.waterfall([function loadResponsesFromDirectory(next) {
    //     buildDictionary.optional({
    //         dirname: dir,
    //         filter: /^([^.]+)\.(js|coffee|litcoffee)$/,
    //         replaceExpr: /^.*\//,
    //         flattenDirectories: true
    //     }, next);

    // }, function injectResponsesIntoSails(modules, next) {
    //     sails.responses = _.merge(modules || {}, sails.responses || {});
        
    //     if (sails.config.globals.responses) {
    //         _.each(modules, function (response, responseId) {
    //             global[response.globalId] = response;
    //         });
    //     }

    //     return next(null);
    // }], function (err) {
    //     return cb(err);
    // });
};
