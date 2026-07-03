import Table from "../models/Table.js";

// @route  GET /api/tables
// @access Private (any authenticated user - customers need this to pick a table)
const getTables = async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true }).sort('tableNumber');
    res.status(200).json({ success: true, count: tables.length, data: tables });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch tables' });
  }
};

// @route  POST /api/tables
// @access Private/Admin
const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    if (tableNumber === undefined || capacity === undefined) {
      return res.status(400).json({ success: false, message: 'tableNumber and capacity are required' });
    }

    const table = await Table.create({ tableNumber, capacity });
    res.status(201).json({ success: true, data: table });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A table with this number already exists' });
    }
    res.status(500).json({ success: false, message: err.message || 'Failed to create table' });
  }
};

// @route  PUT /api/tables/:id
// @access Private/Admin
const updateTable = async (req, res) => {
  try {
    const { capacity, isActive } = req.body;

    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

    if (capacity !== undefined) table.capacity = capacity;
    if (isActive !== undefined) table.isActive = isActive;

    await table.save();
    res.status(200).json({ success: true, data: table });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update table' });
  }
};

// @route  DELETE /api/tables/:id
// @access Private/Admin
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

    // Soft delete so historical reservations still resolve correctly
    table.isActive = false;
    await table.save();

    res.status(200).json({ success: true, message: 'Table deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete table' });
  }
};

export { getTables, createTable, updateTable, deleteTable };
