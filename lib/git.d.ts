import { ActionInterface, Status } from './constants';
export declare function init(action: ActionInterface): Promise<void | Error>;
export declare function deploy(action: ActionInterface): Promise<Status>;
