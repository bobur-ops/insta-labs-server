import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import * as UserService from "./user.service";
import { IgApiClient } from "instagram-private-api";

import { getCurrentUser, login } from "../services";

const ig = new IgApiClient();

ig.state.generateDevice(process.env.IG_USERNAME || "");

export const userRouter = express.Router();

userRouter.get("/test", async (request: Request, response: Response) =>
  response.status(200).json({ message: "It works fine" })
);

// Get a list of users example
userRouter.get("/", async (request: Request, response: Response) => {
  try {
    const users = await UserService.listUsers();
    return response.status(200).json(users);
  } catch (error: any) {
    return response.status(500).json(error.message);
  }
});

// GET: a single user
userRouter.get("/single/:id", async (request: Request, response: Response) => {
  const id = parseInt(request.params.id, 10);

  try {
    const user = await UserService.getUser(id);
    if (user) {
      return response.status(200).json(user);
    }
    return response.status(404).json({ message: "Could not find a user" });
  } catch (error: any) {
    return response.status(500).json(error.message);
  }
});

// CREATE new user
userRouter.post(
  "/create",
  body("username").isString(),
  body("password").isString(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const user = request.body;
      const loggedInUser = await ig.account.login(user.username, user.password);
      const newUser = await UserService.createUser({
        ...user,
        pk: loggedInUser.pk.toString(),
      });
      return response.status(201).json({
        message: "User created successfully",
        userPk: loggedInUser.pk,
      });
    } catch (error: any) {
      console.log(error);
      return response.status(500).json(error.message);
    }
  }
);

userRouter.get(
  "/getUserInfo/:username",
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const id = request.params.username;

    try {
      const pk = await ig.user.getIdByUsername(id);
      const userInfo = await ig.user.info(pk);

      if (userInfo) {
        return response.status(200).json(userInfo);
      }
      return response.status(404).json({ message: "Something went wrong" });
    } catch (error: any) {
      return response.status(500).json({ message: error });
    }
  }
);

userRouter.post("/login", async (request: Request, response: Response) => {
  const { username, password } = request.body;

  try {
    const loggedInUser = await login(username, password, ig);

    if (loggedInUser) {
      return response.status(200).json(loggedInUser);
    }

    return response.status(404).json({ message: "Something went wrong" });
  } catch (error: any) {
    return response.status(500).json({ message: error });
  }
});

userRouter.get(
  "/getCurrentUser",
  async (request: Request, response: Response) => {
    try {
      const loggedInUser = await getCurrentUser(ig);

      if (loggedInUser) {
        return response.status(200).json(loggedInUser);
      }

      return response.status(404).json({ message: "Something went wrong" });
    } catch (error: any) {
      console.log(error);
      return response.status(500).json({ message: error.message });
    }
  }
);
