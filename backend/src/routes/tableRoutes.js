import express from "express";
import { createTable, deleteTable, getTables, updateTable } from "../controllers/tableController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.get('/', protect, getTables);
router.post('/', protect, authorize('admin'), createTable);
router.put('/:id', protect, authorize('admin'), updateTable);
router.delete('/:id', protect, authorize('admin'), deleteTable);

export default router;
