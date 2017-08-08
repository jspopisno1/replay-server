var express = require('express');
var app = express();

require('./module/replay').init(app);

/**
 * // set from env, for instance, `PORT=4000 npm start`
 * @def: PORT: string
 *
 */
var PORT = process.env.PORT || 8500;

app.listen(PORT, function (err) {
    if (err) {
        console.log(err);
        return;
    }

    console.info('The server is up on port ' + PORT);
});