import path from 'node:path';
import querystring from 'node:querystring';
import {
  parse,
} from 'node:url';
import {
  serializeError,
} from 'serialize-error';
import {
  Logger,
} from '../Logger';
import {
  getPublicPath,
} from './getPublicPath';

const log = Logger.child({
  namespace: 'getFilenameFromUrl',
});

export const getFilenameFromUrl = (outputFileSystem, stats, url) => {
  let foundFilename = null;
  let urlObject;

  try {
    // The `url` property of the `request` is contains only  `pathname`, `search` and `hash`
    urlObject = parse(url, false, true);
  } catch (error) {
    log.trace({
      error: serializeError(error),
    }, 'could not parse URL');

    return null;
  }

  const {
    publicPath,
    outputPath,
  } = getPublicPath(stats);

  let filename;
  let publicPathObject;

  try {
    publicPathObject = parse(
      publicPath !== 'auto' && publicPath ? publicPath : '/',
      false,
      true,
    );
  } catch (error) {
    log.trace({
      error: serializeError(error),
    }, 'could not parse URL');

    return null;
  }

  if (urlObject.pathname.startsWith(publicPathObject.pathname)) {
    filename = outputPath;

    // Strip the `pathname` property from the `publicPath` option from the start of requested url
    // `/complex/foo.js` => `foo.js`
    const pathname = urlObject.pathname.slice(publicPathObject.pathname.length);

    if (pathname) {
      filename = path.join(outputPath, querystring.unescape(pathname));
    }

    let fsStats;

    try {
      fsStats = outputFileSystem.statSync(filename);
    } catch (error) {
      if (error.message.includes('no such file or directory')) {
        log.trace('no such file or directory %s', filename);
      } else {
        log.trace({
          error: serializeError(error),
        }, 'could not stat path');
      }

      return null;
    }

    if (fsStats.isFile()) {
      foundFilename = filename;
    }
  }

  return foundFilename;
};
