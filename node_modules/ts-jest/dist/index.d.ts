import { createJestPreset as createJestPresetCore } from './config/create-jest-preset';
import { TsJestTransformer } from './ts-jest-transformer';
import { TsJestGlobalOptions } from './types';
import { mocked as mockedCore } from './util/testing';
declare module '@jest/types' {
    namespace Config {
        interface ConfigGlobals {
            'ts-jest': TsJestGlobalOptions;
        }
    }
}
export declare const mocked: typeof mockedCore;
export declare const createJestPreset: typeof createJestPresetCore;
export declare const pathsToModuleNameMapper: (mapping: import("typescript").MapLike<string[]>, { prefix }?: {
    prefix?: string | undefined;
}) => {
    [key: string]: string | string[];
} | undefined;
export declare const version: string;
export declare const digest: string;
export declare function createTransformer(baseConfig?: TsJestGlobalOptions): TsJestTransformer;
declare const jestPreset: import("./config/create-jest-preset").TsJestPresets;
export { jestPreset, };
