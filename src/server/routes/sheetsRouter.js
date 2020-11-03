/**
 * router to handle all brizo related routes
 */
import express from "express";
import { default as uuidv1 } from "uuid/v1";
import { validator as validate } from "../middlewares";
import { logger } from "../middlewares/logger";
import { getCluster } from "../../scrapers/cluster";
import { start } from "../../scrapers/booking";
import { startReviews } from "../../scrapers/booking/reviewpage";

const sheetsRouter = express.Router();

sheetsRouter.get("/", async (req, res, next) => {
  try {
    res.status(200).json({ status: true });
  } catch (error) {
    next(new Error(error));
  }
});

sheetsRouter.post("/start", async (req, res, next) => {
  try {
    let { city, baseUrl, collection } = req.body;
    //get cluster
    global.cluster = await getCluster();
    //start job
    start(global.cluster, collection, city, baseUrl);
    res.status(200).json({ status: true });
  } catch (error) {
    next(new Error(error));
  }
});

export default sheetsRouter;
