var fs = require('fs');
var npath = require('path');
var utils = require('./utils');

var PROJECT_DATA = utils.p(__dirname + '/../data/project-data.json');
var REPLAY_FOLDER = utils.p(__dirname + '/../data/replays') + '/';

// @start-def: fileService;
var fileService = {
    randomKey: function () {
        return (+new Date()).toString(36) + '_' + Math.random().toString(36).slice(2) + '_' + (this.projectData.seq++).toString(36);
    },

    ensureFolder: function (target) {
        var parentDirname = npath.dirname(target);
        if (!fs.existsSync(parentDirname)) {
            this.ensureFolder(parentDirname);

            fs.mkdirSync(parentDirname);
        }
    },

    writeJSON: function (path, value) {
        path = utils.p(path);

        this.ensureFolder(path);
        fs.writeFileSync(path, JSON.stringify(value, null, 3));
    },

    readJSON: function (path, defaultValue) {
        path = utils.p(path);

        try {
            var jsonString = fs.readFileSync(path);
            var json = JSON.parse(jsonString);

            return json;
        }
        catch (ex) {
            return defaultValue;
        }
    },

    /**
     * @def: .projectData: {}
     *  projects: {}
     *      // replays will be sorted by updated timestamp
     *      projectId: []
     *          _i: {}
     *              replayId: string
     *              updatedAt: number
     *              jsonFileName: string    // name of the json file holds the replayData. it should be unique.
     */
    init: function () {
        if (!this.projectData) {
            this.projectData = this.readJSON(PROJECT_DATA,
                /**
                 * projects: ProjectData
                 */
                {projects: {}, seq: 0}
            );
        }
    },

    /**
     *
     * @def: .writeReplay: (projectId, replayId, replayData) => statusInfo
     *  projectId: string
     *  replayData: any     // currently, the schema of the data depends on how frontend instructs
     *  statusInfo: {}
     *      status: 'ok' | 'fail'
     *      message: string | undefined
     */
    writeReplay: function (projectId, replayData) {
        var now = +new Date();

        var replayList = this.projectData.projects[projectId];
        if (!replayList) {
            replayList = this.projectData.projects[projectId] = [];
        }

        // get the json file name for the target replay
        var replayKey = this.randomKey();
        var replay = {
            key: replayKey,
            updatedAt: now
        };

        // dump replay data to fs
        this.writeJSON(REPLAY_FOLDER + replayKey + '.json', replayData);

        replayList.unshift(replay);

        for (var i = 200; i < replayList.length; i++) {
            fs.unlinkSync(REPLAY_FOLDER + replayList[i] + '.json');
        }
        replayList.splice(200);

        this.writeJSON(PROJECT_DATA, this.projectData);

        // @todo error detection
        return {
            status: 'ok'
        };
    },

    /**
     *
     * // currently it only depends on how the data is stored from the frontend
     * @def: ~Relay: any
     *
     * @def: .readReplay: (projectId, replayId) => result
     *  projectId: string
     *  replayId: string
     *  result: {}
     *      status: 'ok' | 'fail'
     *      message: string
     *      data: []
     *          _i: Replay
     */
    readReplay: function (projectId, replayId) {

    },

    /**
     * // note that replayId seems not to be unique at the current version
     * @def: .listReplaysByProjectId: (projectId, currentPage, pageSize) => result
     *  result: {}
     *      status: 'ok' | 'fail'
     *      message: string
     *      data: []
     *          _i: string  // id of a replay
     */
    listReplaysByProjectId: function (projectId, currentPage, pageSize) {
        currentPage = currentPage || 0;
        currentPage = parseInt(currentPage);
        if (isNaN(currentPage)) {
            currentPage = 0;
        }


    }
};

fileService.init();

module.exports = utils.exportMethods(fileService, [
    'writeReplay',
    'readReplay',
    'listReplaysByProjectId'
]);