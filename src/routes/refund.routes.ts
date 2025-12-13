import { Router } from "express";
import {
  getAllRefunds,
  getRefund,
  createRefund,
  updateRefund,
  deleteRefund,
} from "../controllers/refund.controller";

const router: Router = Router();

router.route("/").get(getAllRefunds).post(createRefund);

router.route("/:id").get(getRefund).patch(updateRefund).delete(deleteRefund);

export default router;
