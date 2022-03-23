import type {
  Stats,
  StatsCompilation,
} from 'webpack';
import type {
  SyncEvent,
} from '../types';

const extractBundles = (stats: StatsCompilation) => {
  if (stats.modules) {
    return [
      stats,
    ];
  }

  if (stats.children) {
    return stats.children;
  }

  throw new Error('Unexpected state.');
};

const buildModuleMap = (modules): Record<string, string> => {
  const map = {};

  for (const module of modules) {
    map[module.id] = module.name;
  }

  return map;
};

export const createSyncEvents = (stats: Stats): SyncEvent[] => {
  const syncEvents: SyncEvent[] = [];

  const bundles = extractBundles(
    stats.toJson({
      all: false,
      assets: true,
      cached: true,
      children: true,
      hash: true,
      modules: true,
      timings: true,
    }),
  );

  for (const bundleStats of bundles) {
    if (!bundleStats.hash) {
      throw new Error('hash is undefined');
    }

    syncEvents.push({
      assets: bundleStats.assets ?? [],
      errors: bundleStats.errors ?? [],
      hash: bundleStats.hash,
      modules: buildModuleMap(bundleStats.modules),
      warnings: bundleStats.warnings ?? [],
    });
  }

  return syncEvents;
};
