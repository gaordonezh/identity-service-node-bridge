"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityServiceMiddleware = identityServiceMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
function identityServiceMiddleware(config) {
    const client = (0, jwks_rsa_1.default)({
        jwksUri: config.jwksUri,
        cache: true,
        rateLimit: true,
        timeout: 3000,
        cacheMaxAge: 10 * 60 * 1000,
    });
    const getKey = (header, callback) => {
        if (!header.kid) {
            return callback(new Error("No KID in token header"));
        }
        client.getSigningKey(header.kid, (err, key) => {
            if (err) {
                return callback(err);
            }
            const signingKey = key?.getPublicKey();
            callback(null, signingKey);
        });
    };
    return (req, res, next) => {
        const rejectOrContinue = (error) => {
            if (config.passthrough) {
                return next();
            }
            return res.status(401).json({ error });
        };
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return rejectOrContinue("TOKEN_WAS_NOT_PROVIDED");
        }
        const [scheme, token] = authHeader.split(" ");
        if (scheme !== "Bearer" || !token) {
            return rejectOrContinue("INVALID_AUTH_HEADER");
        }
        jsonwebtoken_1.default.verify(token, getKey, {
            issuer: config.issuer,
            audience: config.clientId,
            algorithms: ["RS256"],
            clockTolerance: 5,
        }, (err, decoded) => {
            if (config.log) {
                console.log("[MIDDLEWARE_LOG]:", err, decoded);
            }
            if (err) {
                return rejectOrContinue("INVALID_TOKEN");
            }
            if (typeof decoded !== "object" || !decoded.sub || !decoded.sid) {
                return rejectOrContinue("INVALID_PAYLOAD");
            }
            req.auth = decoded;
            return next();
        });
    };
}
