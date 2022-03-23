/* eslint-disable no-console */

const main = () => {
  const hot = import.meta.webpackHot;

  const eventSource = new EventSource('/hmr');

  hot.addStatusHandler((status) => {
    console.log(status);
  });

  eventSource.addEventListener('sync', (event) => {
    const syncEvent = JSON.parse(event.data);

    console.debug('[fastify-webpack-hot] bundle updated %s', syncEvent.hash);

    if (hot.status() === 'idle') {
      hot.check(true, (error, outdatedModules) => {
        console.error({
          error,
          outdatedModules,
        }, '[fastify-webpack-hot] could not complete check');
      });
    }
  });
};

main();
