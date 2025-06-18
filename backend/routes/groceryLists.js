const express = require('express');
const router = express.Router();
const GroceryList = require('../models/GroceryList');

// Create grocery list
router.post('/', async (req, res) => {
  try {
    const groceryList = new GroceryList(req.body);
    await groceryList.save();
    res.status(201).json(groceryList);
  } catch (error) {
    console.error('Create grocery list error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all grocery lists for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const groceryLists = await GroceryList.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(groceryLists);
  } catch (error) {
    console.error('Get grocery lists error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get active grocery list for a user
router.get('/user/:userId/active', async (req, res) => {
  try {
    const groceryList = await GroceryList.findOne({
      userId: req.params.userId,
      isCompleted: false
    }).sort({ createdAt: -1 });
    
    if (!groceryList) {
      return res.status(404).json({ message: 'No active grocery list found' });
    }
    
    res.json(groceryList);
  } catch (error) {
    console.error('Get active grocery list error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update grocery list
router.put('/:id', async (req, res) => {
  try {
    const groceryList = await GroceryList.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!groceryList) {
      return res.status(404).json({ message: 'Grocery list not found' });
    }
    res.json(groceryList);
  } catch (error) {
    console.error('Update grocery list error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add item to grocery list
router.post('/:id/items', async (req, res) => {
  try {
    const groceryList = await GroceryList.findByIdAndUpdate(
      req.params.id,
      { $push: { items: req.body } },
      { new: true, runValidators: true }
    );
    if (!groceryList) {
      return res.status(404).json({ message: 'Grocery list not found' });
    }
    res.json(groceryList);
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update item in grocery list
router.put('/:id/items/:itemId', async (req, res) => {
  try {
    const groceryList = await GroceryList.findOneAndUpdate(
      { 
        _id: req.params.id,
        'items._id': req.params.itemId
      },
      { 
        $set: {
          'items.$': req.body
        }
      },
      { new: true, runValidators: true }
    );
    if (!groceryList) {
      return res.status(404).json({ message: 'Grocery list or item not found' });
    }
    res.json(groceryList);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove item from grocery list
router.delete('/:id/items/:itemId', async (req, res) => {
  try {
    const groceryList = await GroceryList.findByIdAndUpdate(
      req.params.id,
      { $pull: { items: { _id: req.params.itemId } } },
      { new: true }
    );
    if (!groceryList) {
      return res.status(404).json({ message: 'Grocery list not found' });
    }
    res.json(groceryList);
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete grocery list
router.delete('/:id', async (req, res) => {
  try {
    const groceryList = await GroceryList.findByIdAndDelete(req.params.id);
    if (!groceryList) {
      return res.status(404).json({ message: 'Grocery list not found' });
    }
    res.json({ message: 'Grocery list deleted successfully' });
  } catch (error) {
    console.error('Delete grocery list error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 