var npath = require('path');

var utils = {
    exportMethods: function (target, methods) {
        var exportObject = {};
        methods.forEach(function (methodName) {
            exportObject[methodName] = target[methodName].bind(target);
        });
        return exportObject;
    },

    p: function (path) {
        return npath.resolve(path);
    }
};

module.exports = utils;