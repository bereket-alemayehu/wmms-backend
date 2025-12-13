import { Router } from "express";
import {
  getAllOffices,
  getOffice,
  createOffice,
  updateOffice,
  deleteOffice,
} from "../controllers/office.controller";

const router: Router = Router();

router.route("/").get(getAllOffices).post(createOffice);

router.route("/:id").get(getOffice).patch(updateOffice).delete(deleteOffice);

export default router;

