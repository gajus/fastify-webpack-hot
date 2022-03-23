import type {
  StatsError,
  StatsAsset,
} from 'webpack';

export type SyncEvent = {
  assets: StatsAsset[],
  errors: StatsError[],
  hash: string,
  modules: Record<string, string>,
  warnings: StatsError[],
};
