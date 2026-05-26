import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt, { JwtHeader } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

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

export function identityServiceMiddleware(config: IdentityServiceConfigProps): RequestHandler {
  const client = jwksClient({
    jwksUri: config.jwksUri,
    cache: true,
    rateLimit: true,
    timeout: 3000,
    cacheMaxAge: 10 * 60 * 1000,
  });

  const getKey = (header: JwtHeader, callback: any) => {
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

  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "TOKEN_WAS_NOT_PROVIDED" });
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "INVALID_AUTH_HEADER" });
    }

    jwt.verify(
      token,
      getKey,
      {
        issuer: config.issuer,
        audience: config.clientId,
        algorithms: ["RS256"],
        clockTolerance: 5,
      },
      (err, decoded) => {
        console.log(err, decoded);
        if (err) {
          return res.status(401).json({ error: "INVALID_TOKEN" });
        }

        if (typeof decoded !== "object" || !decoded.sub || !decoded.sid) {
          return res.status(401).json({ error: "INVALID_PAYLOAD" });
        }

        req.auth = decoded as SSOJwtPayload;
        next();
      },
    );
  };
}
