import { Router } from "express";
import {
  getAllOutages,
  getOutage,
  createOutage,
  updateOutage,
  deleteOutage,
} from "../controllers/outage.controller";

const router: Router = Router();

router.route("/").get(getAllOutages).post(createOutage);

router.route("/:id").get(getOutage).patch(updateOutage).delete(deleteOutage);

export default router;

