import { CacheKeyOptions, TransformOptions, TransformedSource, Transformer } from '@jest/transform';
import { Config } from '@jest/types';
import { ConfigSet } from './config/config-set';
import { TsJestGlobalOptions } from './types';
export declare class TsJestTransformer implements Transformer {
    private readonly logger;
    private readonly id;
    private readonly options;
    constructor(baseOptions?: TsJestGlobalOptions);
    configsFor(jestConfig: Config.ProjectConfig): ConfigSet;
    process(input: string, filePath: Config.Path, jestConfig: Config.ProjectConfig, transformOptions?: TransformOptions): TransformedSource | string;
    getCacheKey(fileContent: string, filePath: string, _jestConfigStr: string, transformOptions: CacheKeyOptions): string;
}
