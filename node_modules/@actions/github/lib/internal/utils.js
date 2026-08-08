var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as httpClient from '@actions/http-client';
import { fetch } from 'undici';
export function getAuthString(token, options) {
    if (!token && !options.auth) {
        throw new Error('Parameter token or opts.auth is required');
    }
    else if (token && options.auth) {
        throw new Error('Parameters token and opts.auth may not both be specified');
    }
    return typeof options.auth === 'string' ? options.auth : `token ${token}`;
}
export function getProxyAgent(destinationUrl) {
    const hc = new httpClient.HttpClient();
    return hc.getAgent(destinationUrl);
}
export function getProxyAgentDispatcher(destinationUrl) {
    const hc = new httpClient.HttpClient();
    return hc.getAgentDispatcher(destinationUrl);
}
export function getProxyFetch(destinationUrl) {
    const httpDispatcher = getProxyAgentDispatcher(destinationUrl);
    const proxyFetch = (url, opts) => __awaiter(this, void 0, void 0, function* () {
        return fetch(url, Object.assign(Object.assign({}, opts), { dispatcher: httpDispatcher }));
    });
    return proxyFetch;
}
export function getApiBaseUrl() {
    return process.env['GITHUB_API_URL'] || 'https://api.github.com';
}
export function getUserAgentWithOrchestrationId(baseUserAgent) {
    var _a;
    const orchId = (_a = process.env['ACTIONS_ORCHESTRATION_ID']) === null || _a === void 0 ? void 0 : _a.trim();
    if (orchId) {
        const sanitizedId = orchId.replace(/[^a-z0-9_.-]/gi, '_');
        const tag = `actions_orchestration_id/${sanitizedId}`;
        if (baseUserAgent === null || baseUserAgent === void 0 ? void 0 : baseUserAgent.includes(tag))
            return baseUserAgent;
        const ua = baseUserAgent ? `${baseUserAgent} ` : '';
        return `${ua}${tag}`;
    }
    return baseUserAgent;
}
//# sourceMappingURL=utils.js.map