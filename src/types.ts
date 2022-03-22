import type {
  StatsError,
} from 'webpack';

export type SyncEvent = {
  errors: StatsError[],
  hash: string,
  modules: Record<string, string>,
  warnings: StatsError[],
};
