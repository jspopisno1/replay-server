var express = require('express');
var bodyParser = require('body-parser');

var replayModule = {
    wrapData: function (res, data, status, message) {
        status = status || 'ok';
        message = message || '';

        res.send({
            status: status,
            message: message,
            data: data
        })
    },


    init: function (app, service) {
        var mod = this;
        this.service = service;

        app.use('/api/*', bodyParser.json());

        app.all('/api/save-replay', replayModule.middlewareEnableCORS, function (req, res) {
            var data = req.body;

            console.log(req.body);

            mod.service.writeReplay(data.projectId, data.replayData)

            mod.wrapData(res, {});
        });

        app.all('/api/load-replay', replayModule.middlewareEnableCORS, function (req, res) {
            mod.wrapData(res, {});
        });

        app.all('/api/get-project-replay-list', replayModule.middlewareEnableCORS, function (req, res) {
            mod.wrapData(res, {});
        });

        app.use('/test-ui', express.static(__dirname + '/../test-ui'));
    },

    /**
     * // The middleware which set the `access-control-allow-origin: *` to the header of response
     * @def: .middlewareCORSFlag: (req, res, next) => undefined
     *      req: Request
     *      res: Response
     *      next: MiddlewareNext
     */
    middlewareEnableCORS: function (req, res, next) {
        res.setHeader('access-control-allow-origin', '*');
        next();
    }
};

module.exports = replayModule;