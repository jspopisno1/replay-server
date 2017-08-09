var fs = require('fs');
var npath = require('path');
var utils = require('./utils');

var PROJECT_DATA = utils.p(__dirname + '/../data/project-data.json');
var REPLAY_FOLDER = utils.p(__dirname + '/../data/replays') + '/';

// @start-def: fileService;
var fileService = {
    /**
     * @def: .randomKey: () => randomKey
     *  randomKey: string   // 一个足够 unique 的 random 字符串 (用于给 replay 作为 id)
     */
    randomKey: function () {
        return (+new Date()).toString(36) + '__' + (this.projectData.seq ++) + '__' + Math.random().toString(36).slice(2, 8);
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
     *      projectId: {}
     *          descr: string       // description of the project
     *          replays: []
     *              _i: {}
     *                  key: string     // name of the json file holds the replayData. it should be unique.
     *                  descr: string   // descr of the replay
     *                  updatedAt: number
     *      seq: number             // for replay id generation
     */
    init: function () {
        if (!this.projectData) {
            this.projectData = this.readJSON(PROJECT_DATA,
                {projects: {}, seq: 0}
            );
        }
    },

    getReplayPath: function (replayId) {
        return REPLAY_FOLDER + replayId + '.json';
    },

    getProject: function (projectId) {
        this.projectData.projects[projectId] = this.projectData.projects[projectId] || {replays: [], descr: ''};
        return this.projectData.projects[projectId];
    },

    /**
     *
     * @def: .writeReplay: (projectId, replayId, replayData) => result
     *  projectId: string
     *  replayData: any     // currently, the schema of the data depends on how frontend instructs
     *  result: {}
     *      status: 'ok' | 'fail'
     *      message: string | undefined
     *      replayId: string
     */
    writeReplay: function (projectId, descr, replayData) {
        var now = +new Date();
        descr = descr || '';

        var replayList = this.getProject(projectId).replays;

        // get the json file name for the target replay
        var replayId = this.randomKey();
        var replay = {
            id: replayId,
            descr: descr,
            updatedAt: now
        };

        // dump replay data to fs
        this.writeJSON(this.getReplayPath(replayId), {
            id: replayId,
            projectId: projectId,
            updatedAt: now,
            descr: descr,
            replayData: replayData
        });

        replayList.unshift(replay);

        var MAX_REPLAY = 150
        for (var i = MAX_REPLAY; i < replayList.length; i++) {
            fs.unlinkSync(this.getReplayPath(replayList[i].id));
        }
        replayList.splice(MAX_REPLAY);

        this.writeJSON(PROJECT_DATA, this.projectData);

        // @todo error detection
        return {
            status: 'ok',
            data: {
                replayId: replayId
            }
        };
    },

    /**
     *
     * // currently it only depends on how the data is stored from the frontend
     * @def: ~Replay: any
     *
     * @def: ~ReplayInfo: {}
     *  id: string
     *  projectId: projectId
     *  descr: string
     *  updatedAt: number
     *  replayData: []
     *      _i: #Replay
     *
     * @def: .readReplay: (projectId, replayId) => result
     *  projectId: string
     *  replayId: string
     *  result: {}
     *      status: 'ok' | 'fail'
     *      message: string
     *      data: #ReplayInfo
     */
    readReplay: function (replayId) {
        var replay = this.readJSON(this.getReplayPath(replayId));

        console.log(replay, replayId);

        // @todo error detection
        return {
            status: 'ok',
            data: replay
        };
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
        currentPage = currentPage || 1;
        currentPage = parseInt(currentPage);

        pageSize = pageSize || 20;

        if (isNaN(currentPage)) {
            currentPage = 0;
        }

        var project = this.getProject(projectId);
        var replayList = project.replays;

        var slice = replayList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        // @todo error detection
        return {
            status: 'ok',
            data: slice
        };
    }
};

fileService.init();

module.exports = utils.exportMethods(fileService, [
    'writeReplay',
    'readReplay',
    'listReplaysByProjectId'
]);