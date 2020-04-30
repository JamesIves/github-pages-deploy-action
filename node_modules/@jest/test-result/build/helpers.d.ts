/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { AggregatedResult, TestResult } from './types';
export declare const makeEmptyAggregatedTestResult: () => AggregatedResult;
export declare const buildFailureTestResult: (testPath: string, err: import("@jest/types/build/TestResult").SerializableError) => TestResult;
export declare const addResult: (aggregatedResults: AggregatedResult, testResult: TestResult) => void;
export declare const createEmptyTestResult: () => TestResult;
