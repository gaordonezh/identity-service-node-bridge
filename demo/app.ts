import express from "express";
import cors from "cors";
import userRoutes from "./users/user.routes.js";

class AppServer {
  private readonly app: express.Application;

  constructor() {
    this.app = express();

    this.middlewares();
    this.initializeRoutes();
  }

  private middlewares() {
    this.app.use(cors({ origin: "http://localhost:6001", credentials: true }));
  }

  private initializeRoutes() {
    this.app.use("", userRoutes);
  }

  initializeServer() {
    const PORT = 4000;
    this.app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

export default AppServer;
