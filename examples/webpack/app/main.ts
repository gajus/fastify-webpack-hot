import {
  hello,
} from './hello';

hello();

import.meta.webpackHot.accept('./hello.ts', () => {
  hello();
});
