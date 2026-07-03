import express from "express";
import { authorize, protect } from "../middleware/auth";
import { cancelReservation, createAdmin, getAllReservations, updateReservation } from "../controllers/adminController (1)";

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/reservations', getAllReservations);
router.put('/reservations/:id', updateReservation);
router.delete('/reservations/:id', cancelReservation);
router.post('/create-admin', createAdmin);

export default router;
