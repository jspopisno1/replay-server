var fs = require('fs');
var npath = require('path');
var utils = require('./utils');

var fileService = {
    writeJSON: function () {
    },
    readJSON: function () {
    },

    writeReplay: function (projectId, replayId) {

    },
    readReplay: function (projectId, replayId) {

    },
    listReplaysByProjectId: function (projectId) {
        
    }
};

module.exports = utils.exportMethods(fileService, [
    'writeReplay',
    'readReplay',
    'listReplaysByProjectId'
]);