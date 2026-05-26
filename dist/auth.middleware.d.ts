import { RequestHandler } from "express";
declare global {
    namespace Express {
        interface Request {
            auth?: SSOJwtPayload;
        }
    }
}
export interface SSOJwtPayload {
    /**
     * User ID
     */
    sub: string;
    /**
     * Session ID
     */
    sid: string;
    jti: string;
    fullname: string;
    firstname: string;
    lastname: string;
    email: string;
    iat: number;
    exp: number;
    aud: Array<string>;
    iss: string;
    [x: string]: any;
}
export interface IdentityServiceConfigProps {
    jwksUri: string;
    issuer: string;
    clientId: string;
}
export declare function identityServiceMiddleware(config: IdentityServiceConfigProps): RequestHandler;
