import express from "express";
import { cancelMyReservation, checkAvailability, createReservation, getMyReservations } from "../controllers/reservationController.js";
import { authorize, protect } from "../middleware/auth.js";
const router = express.Router();

router.use(protect, authorize('customer'));

router.get('/availability', checkAvailability);
router.post('/', createReservation);
router.get('/my', getMyReservations);
router.delete('/:id', cancelMyReservation);

export default router;
