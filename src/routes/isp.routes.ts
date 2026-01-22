import express from "express";
import * as ispController from "../controllers/isp.controller";

const router: express.Router = express.Router();

// Public verification endpoint
router.get("/verify/:serviceNumber", ispController.verifyServiceNumber);

// Getting customer info (might need protection later, but for now kept as requested)
router.get("/customer/:serviceNumber", ispController.getCustomerInfo);

// router.post("/create", ispController.createCustomer);

export default router;
