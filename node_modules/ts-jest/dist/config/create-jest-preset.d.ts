import { Config } from '@jest/types';
export interface TsJestPresets {
    transform: Config.InitialOptions['transform'];
    testMatch?: string[];
    moduleFileExtensions?: string[];
}
export interface CreateJestPresetOptions {
    allowJs?: boolean;
}
export declare function createJestPreset({ allowJs }?: CreateJestPresetOptions, from?: Config.InitialOptions): TsJestPresets;
