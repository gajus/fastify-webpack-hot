/* eslint-disable no-console */

const main = () => {
  const hot = import.meta.webpackHot;

  const eventSource = new EventSource('/hmr');

  eventSource.addEventListener('sync', (event) => {
    const syncEvent = JSON.parse(event.data);

    console.debug('[fastify-webpack] bundle updated %s', syncEvent.hash);

    if (hot.status() === 'idle') {
      console.log('CHECK');
      hot.check(true, (error, outdatedModules) => {
        console.error({
          error,
          outdatedModules,
        }, '[fastify-webpack] could not complete check');
      });
    }
  });
};

main();
