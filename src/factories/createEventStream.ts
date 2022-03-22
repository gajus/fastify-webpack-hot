export const createEventStream = () => {
  const heartbeat = 1_000;

  let clientId = 0;
  let clients = {};
  function everyClient (function_) {
    for (const id of Object.keys(clients)) {
      function_(clients[id]);
    }
  }

  const interval = setInterval(() => {
    everyClient((client) => {
      client.write('data: \uD83D\uDC93\n\n');
    });
  }, heartbeat).unref();

  return {
    close () {
      clearInterval(interval);
      everyClient((client) => {
        if (!client.finished) {
          client.end();
        }
      });
      clients = {};
    },
    handler (request, res) {
      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-transform',
        'Content-Type': 'text/event-stream;charset=utf-8',
        // While behind nginx, event stream should not be buffered:
        // http://nginx.org/docs/http/ngx_http_proxy_module.html#proxy_buffering
        'X-Accel-Buffering': 'no',
      };

      const isHttp1 = !(Number.parseInt(request.httpVersion, 10) >= 2);
      if (isHttp1) {
        request.socket.setKeepAlive(true);
        Object.assign(headers, {
          Connection: 'keep-alive',
        });
      }

      res.writeHead(200, headers);
      res.write('\n');
      const id = clientId++;
      clients[id] = res;
      request.on('close', () => {
        if (!res.finished) {
          res.end();
        }

        delete clients[id];
      });
    },
    publish (payload) {
      everyClient((client) => {
        client.write('data: ' + JSON.stringify(payload) + '\n\n');
      });
    },
  };
};
