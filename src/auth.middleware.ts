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
  // accessConfig: Array<KeycloakFrontendAccessConfigProps>;
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

        // VER LAS VALIDACIONES DE ESTE CÓDIGO DESPUÉS DE LOS AUDIENCES & ACCESOS
        // const frontOriginClientId = decoded.azp;
        // const record = config.accessConfig.find((r) => r.clientId === frontOriginClientId);
        // if (!record) {
        //   return res.status(403).json({ error: "FORBIDDEN" });
        // }
        // const roles = decoded.resource_access[frontOriginClientId]?.roles ?? [];
        // if (!roles.includes(record.access)) {
        //   return res.status(403).json({ error: "FORBIDDEN_" });
        // }

        req.auth = decoded as SSOJwtPayload;
        next();
      },
    );
  };
}
