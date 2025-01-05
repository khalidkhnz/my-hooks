import { Response, Router } from "express";
import { Model, Document } from "mongoose";
import { AuthenticatedRequest } from "../middlewares/authorization.middleware";

interface IMiddlewares {
  GET_ALL?: any[];
  GET_BY_ID?: any[];
  GET_ONE?: any[];
  CREATE?: any[];
  UPDATE?: any[];
  DELETE?: any[];
}

type IModifyBodyType = <T>(
  val: T,
  req: AuthenticatedRequest,
  res: Response
) => { body: T; success: boolean };

type IModifyQueriesType = <T>(
  val: T,
  req: AuthenticatedRequest,
  res: Response
) => { queries: T; success: boolean };

interface IModifyBody {
  GET_ALL?: IModifyBodyType;
  GET_BY_ID?: IModifyBodyType;
  GET_ONE?: IModifyBodyType;
  CREATE?: IModifyBodyType;
  UPDATE?: IModifyBodyType;
}

interface IModifyQuery {
  GET_ALL?: IModifyQueriesType;
  GET_BY_ID?: IModifyQueriesType;
  GET_ONE?: IModifyQueriesType;
}

type IControllerNames =
  | "GET_ALL"
  | "GET_BY_ID"
  | "GET_ONE"
  | "CREATE"
  | "UPDATE"
  | "DELETE";

interface IGetAllChecks {
  changeUniqueField?: string;
  fieldsForSearchQuery?: string[];
  modifyFindQuery?: (
    queries: Record<string, any>,
    req: AuthenticatedRequest,
    res: Response
  ) => Record<string, any>;
}
interface IGetByIdChecks {
  changeUniqueField?: string;
}
interface IGetOneChecks {
  changeUniqueField?: string;
}
interface ICreateChecks {
  changeUniqueField?: string;
  checkIfAlreadyExists?: string[];
}
interface IUpdateChecks {
  changeUniqueField?: string;
  checkIfAlreadyExists?: string[];
}
interface IDeleteChecks {
  changeUniqueField?: string;
}

interface IApplyChecks {
  changeUniqueField?: string;
  controllers?: {
    GET_ALL?: IGetAllChecks;
    GET_BY_ID?: IGetByIdChecks;
    GET_ONE?: IGetOneChecks;
    CREATE?: ICreateChecks;
    UPDATE?: IUpdateChecks;
    DELETE?: IDeleteChecks;
  };
}

interface IConstructer<T> {
  name: string;
  logging?: boolean;
  model: Model<T>;
  middlewares?: IMiddlewares;
  router: Router;
  routeName: string;
  modifyBody?: IModifyBody;
  modifyQuery?: IModifyQuery;
  applyChecks?: IApplyChecks;
}

const handleServerError = (res: Response, error: any) => {
  res
    .status(500)
    .json({ success: false, error: error.message || "Server Error" });
};

export default class GenericController<T extends Document> {
  private name: string;
  private logging: boolean;
  private model: Model<T>;
  private router: Router;
  private routeName: string;
  private middlewares: IMiddlewares;
  private modifyQuery: IModifyQuery;
  private modifyBody: IModifyBody;
  private applyChecks?: IApplyChecks;

  constructor({
    name,
    logging,
    model,
    routeName,
    middlewares,
    router,
    modifyBody,
    modifyQuery,
    applyChecks,
  }: IConstructer<T>) {
    this.logging = !!logging;
    this.name = name;
    this.applyChecks = applyChecks;
    this.modifyQuery = modifyQuery || {
      GET_BY_ID: (v) => ({ success: true, queries: v }),
      GET_ALL: (v) => ({ success: true, queries: v }),
      GET_ONE: (v) => ({ success: true, queries: v }),
    };
    this.modifyBody = modifyBody || {
      CREATE: (v) => ({ success: true, body: v }),
      UPDATE: (v) => ({ success: true, body: v }),
      GET_BY_ID: (v) => ({ success: true, body: v }),
      GET_ALL: (v) => ({ success: true, body: v }),
      GET_ONE: (v) => ({ success: true, body: v }),
    };
    this.model = model;
    this.router = router;
    this.routeName = routeName;
    this.middlewares = middlewares || {
      CREATE: [],
      GET_ALL: [],
      GET_BY_ID: [],
      GET_ONE: [],
      UPDATE: [],
      DELETE: [],
    };
    this.initializeRoutes();
  }

  private logReq(req: AuthenticatedRequest) {
    if (this.logging)
      console.log(
        `\x1b[34m[${new Date().toISOString()}]\x1b[0m ${req.ip} - "\x1b[32m${
          req.method
        }\x1b[0m \x1b[36m${req.originalUrl}\x1b[0m" "\x1b[35m${req.get(
          "User-Agent"
        )}\x1b[0m"`
      );
  }

  private uniqueID(controllerName: IControllerNames): string {
    const controller = this.applyChecks?.controllers?.[controllerName];
    return (
      controller?.changeUniqueField ||
      this.applyChecks?.changeUniqueField ||
      "_id"
    );
  }

  private async handleCheckForAlreadyExistingData(
    controllerName: "UPDATE" | "CREATE",
    body: any,
    model: Model<T>,
    res: Response
  ): Promise<boolean> {
    try {
      const fieldsToCheck =
        this.applyChecks?.controllers?.[controllerName]?.checkIfAlreadyExists ||
        [];
      const responses = await Promise.all(
        fieldsToCheck.map(async (field) => {
          if (body[field]) {
            return await model.findOne({ [field]: body[field] } as Record<
              string,
              any
            >);
          }
          return null;
        })
      );

      if (responses.some((response) => response)) {
        res.status(409).json({
          success: false,
          message: `These fields [${fieldsToCheck.join(
            ","
          )}] are already existing`,
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Something went wrong" });
      return true;
    }
  }
  private initializeRoutes() {
    console.log(`\nInit Generic Controller - ${this.name}`);

    const RouteNames = {
      GET_ALL: `${this.routeName}`,
      GET_BY_ID: `${this.routeName}/:${this.uniqueID("GET_BY_ID")}`,
      GET_ONE: `${this.routeName}/find/one`,
      CREATE: `${this.routeName}`,
      UPDATE: `${this.routeName}/:${this.uniqueID("UPDATE")}`,
      DELETE: `${this.routeName}/:${this.uniqueID("DELETE")}`,
    };

    const routes = [
      {
        path: RouteNames.GET_ALL,
        method: "get",
        middlewares: this.middlewares.GET_ALL,
        controller: this.getAll,
      },
      {
        path: RouteNames.GET_BY_ID,
        method: "get",
        middlewares: this.middlewares.GET_BY_ID,
        controller: this.getById,
      },
      {
        path: RouteNames.GET_ONE,
        method: "get",
        middlewares: this.middlewares.GET_ONE,
        controller: this.getOne,
      },
      {
        path: RouteNames.CREATE,
        method: "post",
        middlewares: this.middlewares.CREATE,
        controller: this.create,
      },
      {
        path: RouteNames.UPDATE,
        method: "put",
        middlewares: this.middlewares.UPDATE,
        controller: this.update,
      },
      {
        path: RouteNames.DELETE,
        method: "delete",
        middlewares: this.middlewares.DELETE,
        controller: this.delete,
      },
    ];

    routes.forEach((route) => {
      console.log(
        `\n\x1b[32m${route.method.toUpperCase()}\x1b[0m \n\x1b[36m${
          route.path
        }\x1b[0m`
      );
      (this.router[route.method as keyof Router] as Function)(route.path, [
        ...(route.middlewares || []),
        route.controller,
      ]);
    });
  }

  getAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      this.logReq(req);
      let {
        queries: { page, limit, search = "", ...QUERIES },
        success,
      } = this.modifyQuery.GET_ALL
        ? this.modifyQuery.GET_ALL(req.query, req, res)
        : { success: true, queries: req.query };

      if (!success) {
        res.status(400).json({ success: false, message: "Invalid Queries" });
        return;
      }

      const LIMIT = Math.max(1, parseInt(`${limit}`, 10) || 10);
      const PAGE = Math.max(1, parseInt(`${page}`, 10) || 1);
      const SKIP = (PAGE - 1) * LIMIT;

      const FieldsForSearch =
        this.applyChecks?.controllers?.GET_ALL?.fieldsForSearchQuery || [];

      const SearchQuery = (FieldsForSearch || []).map(
        (f: string) =>
          ({
            [f]: { $regex: search, $options: "i" },
          } as Record<string, any>)
      );

      const ModifiedFindQuery = this.applyChecks?.controllers?.GET_ALL
        ?.modifyFindQuery
        ? this.applyChecks?.controllers?.GET_ALL?.modifyFindQuery(
            QUERIES as Record<string, any>,
            req,
            res
          )
        : QUERIES;

      const items = await this.model
        .find(ModifiedFindQuery)
        .or(SearchQuery)
        .skip(SKIP)
        .limit(LIMIT);
      const total = await this.model
        .find(ModifiedFindQuery)
        .or(SearchQuery)
        .countDocuments();

      res.status(200).json({
        success: true,
        data: items,
        pagination: { total, limit: Number(limit), page: Number(page) },
      });
    } catch (error) {
      handleServerError(res, error);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      this.logReq(req);

      const { queries: params, success } = this.modifyQuery.GET_BY_ID
        ? this.modifyQuery.GET_BY_ID(req.params, req, res)
        : { queries: req.params, success: true };

      if (!success) {
        res.status(400).json({ success: false, message: "Invalid Params" });
        return;
      }

      if (!params[this.uniqueID("GET_BY_ID")]) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid ID format" });
      }
      const item = await this.model.findOne({
        [this.uniqueID("GET_BY_ID")]: params[this.uniqueID("GET_BY_ID")],
      } as Record<string, any>);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, error: "Item not found" });
      }
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      handleServerError(res, error);
    }
  };

  getOne = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      this.logReq(req);
      const query: any = this.modifyQuery.GET_ONE
        ? this.modifyQuery.GET_ONE(req.query, req, res)
        : req.query;
      const item = await this.model.findOne(query);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, error: "Item not found" });
      }
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      handleServerError(res, error);
    }
  };

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      this.logReq(req);
      const { success, body } = this.modifyBody.CREATE
        ? this.modifyBody.CREATE(req.body, req, res)
        : { success: true, body: req.body };

      if (!success) {
        res.status(400).json({ success: false, message: "Invalid Body" });
        return;
      }

      if (
        await this.handleCheckForAlreadyExistingData(
          "CREATE",
          body,
          this.model,
          res
        )
      )
        return;
      const newItem = await this.model.create(body);
      res.status(201).json({ success: true, data: newItem });
    } catch (error) {
      handleServerError(res, error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      this.logReq(req);
      const { body, success } = this.modifyBody.UPDATE
        ? this.modifyBody.UPDATE(req.body, req, res)
        : { success: true, body: req.body };

      if (!success) {
        res.status(400).json({ success: false, message: "Invalid Body" });
        return;
      }

      if (
        await this.handleCheckForAlreadyExistingData(
          "UPDATE",
          body,
          this.model,
          res
        )
      )
        return;
      const updatedItem = await this.model.findOneAndUpdate(
        {
          [this.uniqueID("UPDATE")]: req.params[this.uniqueID("UPDATE")],
        } as Record<string, any>,
        {
          $set: body,
        },
        { new: true }
      );
      if (!updatedItem) {
        return res
          .status(404)
          .json({ success: false, error: "Item not found" });
      }
      res.status(200).json({ success: true, data: updatedItem });
    } catch (error) {
      handleServerError(res, error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      this.logReq(req);
      const item = await this.model.findOneAndDelete({
        [this.uniqueID("DELETE")]: req.params[this.uniqueID("DELETE")],
      } as Record<string, any>);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, error: "Item not found" });
      }
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      handleServerError(res, error);
    }
  };
}
