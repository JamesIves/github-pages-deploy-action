import { EndpointInterface } from "./EndpointInterface";
import { EndpointOptions } from "./EndpointOptions";
import { RequestParameters } from "./RequestParameters";
import { ResponseHeaders } from "./ResponseHeaders";
import { Route } from "./Route";
import { Url } from "./Url";

export interface RequestInterface {
  /**
   * Sends a request based on endpoint options
   *
   * @param {object} endpoint Must set `method` and `url`. Plus URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  <T = any>(options: EndpointOptions): Promise<OctokitResponse<T>>;

  /**
   * Sends a request based on endpoint options
   *
   * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
   * @param {object} [parameters] URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  <T = any>(route: Route, parameters?: RequestParameters): Promise<
    OctokitResponse<T>
  >;

  /**
   * Returns a new `endpoint` with updated route and parameters
   */
  defaults: (newDefaults: RequestParameters) => RequestInterface;

  /**
   * Octokit endpoint API, see {@link https://github.com/octokit/endpoint.js|@octokit/endpoint}
   */
  endpoint: EndpointInterface;
}

export type OctokitResponse<T> = {
  headers: ResponseHeaders;
  /**
   * http response code
   */
  status: number;
  /**
   * URL of response after all redirects
   */
  url: Url;
  /**
   *  This is the data you would see in https://developer.Octokit.com/v3/
   */
  data: T;
};
