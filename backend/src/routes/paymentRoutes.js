import express from "express";
import { authorize, protect } from "../middleware/auth";
import { createOrder, verifyPayment } from "../controllers/paymentController (1)";
const router = express.Router();

router.use(protect, authorize('customer'));

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

export default router;
