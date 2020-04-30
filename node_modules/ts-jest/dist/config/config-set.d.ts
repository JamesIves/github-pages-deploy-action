import { Config } from '@jest/types';
import { Logger } from 'bs-logger';
import { TsCompiler, TsJestGlobalOptions } from '../types';
export declare class ConfigSet {
    readonly parentOptions?: TsJestGlobalOptions | undefined;
    get versions(): Record<string, string>;
    get tsCompiler(): TsCompiler;
    get tsJestDigest(): string;
    readonly logger: Logger;
    constructor(jestConfig: Config.ProjectConfig, parentOptions?: TsJestGlobalOptions | undefined, parentLogger?: Logger);
}
