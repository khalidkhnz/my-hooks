import express, { Router } from "express";
import authController from "./features/auth/auth.controller";
import config from "./lib/config";
import authenticateToken from "./middlewares/authorization.middleware";
import GenericController from "./services/generic.service";
import PostSchema from "./features/post/post.schema";
import CategoriesSchema from "./features/categories/categories.schema";

export function router(): Router {
  const r = express.Router();

  r.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "welcome to api",
    });
  });

  r.post(`${config.API_VER_PREFIX}/register`, authController.register);
  r.post(`${config.API_VER_PREFIX}/login`, authController.login);
  r.get(`${config.API_VER_PREFIX}/current-user`, authController.currentUser);

  new GenericController<any>({
    name: "Posts",
    logging: true,
    router: r,
    model: PostSchema,
    routeName: `${config.API_VER_PREFIX}/posts-v2`,
    middlewares: {
      CREATE: [authenticateToken],
      UPDATE: [authenticateToken],
      DELETE: [authenticateToken],
    },
    applyChecks: {
      controllers: {
        GET_ALL: {
          fieldsForSearchQuery: ["title", "description"],
        },
        CREATE: {
          checkIfAlreadyExists: ["title"],
        },
        UPDATE: {
          checkIfAlreadyExists: ["title"],
        },
      },
    },
    modifyBody: {
      CREATE(val: any, req) {
        val.author = req.user?.id;
        return { success: true, body: val };
      },
    },
  });

  new GenericController<any>({
    name: "Categories",
    logging: true,
    router: r,
    model: CategoriesSchema,
    routeName: `${config.API_VER_PREFIX}/categories`,
    middlewares: {
      CREATE: [authenticateToken],
      UPDATE: [authenticateToken],
      DELETE: [authenticateToken],
    },
    applyChecks: {
      controllers: {
        GET_ALL: {
          fieldsForSearchQuery: ["name", "description"],
        },
        CREATE: {
          checkIfAlreadyExists: ["name"],
        },
        UPDATE: {
          checkIfAlreadyExists: ["name"],
        },
      },
    },
  });


  r.get("*", (_, res) => {
    res.status(404).json({
      success: false,
      message: "No Resource Found",
    });
  });
  return r;
}
