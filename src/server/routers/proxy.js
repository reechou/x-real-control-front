import router from 'koa-router';
import proxy from 'koa-proxy';
import config from '../../../config/config';

let proxyRouter = router();

proxyRouter.all('/proxy/*', function*(next) {
    this.header['x-username'] = 'zhoulindong';
    yield next;
});

proxyRouter.all('/proxy/*', proxy({
    host: config.proxy,
    map: function(path) {
        return path.substring(6);
    }
}));

export default proxyRouter;
