var bodyParser = require('body-parser');

var replayModule = {
    init: function (app) {
        app.all('/api/save-replay', replayModule.middlewareEnableCORS, function (req, res) {

        });

        app.all('/api/load-replay', replayModule.middlewareEnableCORS, function (req, res) {

        });

        app.all('/api/get-project-replay-list', replayModule.middlewareEnableCORS, function (req, res) {

        });
    },

    /**
     * @def: .middlewareCORSFlag: () => middleware
     *  // return the middleware which set the `access-control-allow-origin: *` to the header of response
     *  middleware: (req, res, next) => undefined
     *      req: Request
     *      res: Response
     *      next: MiddlewareNext
     */
    middlewareEnableCORS: function () {

    }
};

module.exports = replayModule;