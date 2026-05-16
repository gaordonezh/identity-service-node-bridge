import { Request, Response } from "express";

export async function protectedController(_req: Request, res: Response) {
  try {
    const obj = {
      success: true,
      private: true,
      public: false,
    };

    return res.status(200).json(obj);
  } catch (error) {
    return res.status(400).json({ msg: "Error", error });
  }
}

export async function publicController(_req: Request, res: Response) {
  try {
    const obj = {
      success: true,
      private: false,
      public: true,
    };

    return res.status(200).json(obj);
  } catch (error) {
    return res.status(400).json({ msg: "Error", error });
  }
}
