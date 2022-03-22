import {
  useState,
} from 'react';

export const App = () => {
  const [
    count,
    setCount,
  ] = useState<number>(0);

  return <div>
    <div>Hello, World!</div>
    <div>{count} <button
      onClick={() => {
        setCount((currentCount) => {
          return currentCount + 1;
        });
      }} type='button'
    >Increment</button></div>
  </div>;
};
