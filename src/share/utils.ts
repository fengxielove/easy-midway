import { join } from 'path';
import { globby } from 'globby';

export const getAllController = async (baseDir: string) => {
  return await globby(join(baseDir, '/modules/**/controller/**/*.js'));
};
