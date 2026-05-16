import { Router } from "express";
import { protectedController, publicController } from "./users.controller.js";
import { identityServiceMiddleware } from "../../src/auth.middleware.js";

const options = {
  clientId: "resource-api",
  issuer: "http://localhost:3000",
  jwksUri: "http://localhost:3000/.well-known/jwks.json",
};

const router = Router();
router.get("/protected", identityServiceMiddleware(options), protectedController);
router.get("/public", publicController);

export default router;
