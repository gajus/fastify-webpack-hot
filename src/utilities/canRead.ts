import type {
  IFs,
} from 'memfs';

export const canRead = async (fs: IFs, path: string): Promise<boolean> => {
  try {
    await fs.promises.access(path, fs.constants.R_OK);

    return true;
  } catch {
    return false;
  }
};
