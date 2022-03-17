export type DeferredPromise<ValueType> = {
  promise: Promise<ValueType>,
  reject: (reason?: unknown) => void,
  rejected: boolean,
  resolve: (value?: PromiseLike<ValueType> | ValueType) => void,
  resolved: boolean,
};

export const defer = <T>(): DeferredPromise<T> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deferred: any = {
    rejected: false,
    resolved: false,
  };

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = (value) => {
      deferred.resolved = true;

      resolve(value);
    };

    deferred.reject = (error) => {
      deferred.rejected = false;

      reject(error);
    };
  });

  return deferred;
};
