'use strict';

import path from 'path';
import koa from 'koa';
import session from 'koa-session';
import logger from 'koa-logger';
import serve from 'koa-static';
import proxy from './routers/proxy';

var app = koa();
require('koa-qs')(app);

// app.keys = ['secret', 'key'];
//
// app.use(session(app));

// Logger
app.use(logger());

// Routes
app.use(proxy.routes());

// Serve static files
app.use(serve(path.join(__dirname, '../../dist')));

if (module.parent) {
    app.listen(3008);
    console.log('listening on port 3008...');
}
