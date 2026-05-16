import { RequestHandler } from "express";
declare global {
    namespace Express {
        interface Request {
            auth?: SSOJwtPayload;
        }
    }
}
export interface SSOJwtPayload {
    sub: string;
    sid: string;
    jti: string;
    type: string;
    aud: string;
    iss: string;
    [x: string]: any;
}
export interface IdentityServiceConfigProps {
    jwksUri: string;
    issuer: string;
    clientId: string;
}
export declare function identityServiceMiddleware(config: IdentityServiceConfigProps): RequestHandler;
