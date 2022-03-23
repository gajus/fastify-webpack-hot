import {
  Roarr,
} from 'roarr';
import {
  serializeError,
} from 'serialize-error';

const log = Roarr.child({
  namespace: 'client',
  package: 'fastify-webpack-hot',
});

const main = () => {
  const hot = import.meta.webpackHot;

  const eventSource = new EventSource('/__fastify_webpack_hot');

  eventSource.addEventListener('sync', (event) => {
    const syncEvent = JSON.parse(event.data);

    log.debug('[fastify-webpack-hot] bundle updated %s', syncEvent.hash);

    if (hot.status() === 'idle') {
      hot.check(true, (error, outdatedModules) => {
        log.error({
          error: serializeError(error),
          outdatedModules,
        }, '[fastify-webpack-hot] could not complete check');
      });
    }
  });
};

main();
