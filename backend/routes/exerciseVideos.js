const express = require('express');
const router = express.Router();
const ExerciseVideo = require('../models/ExerciseVideo');

// GET /exercise-videos?tag=chest&name=Push%20Up
router.get('/', async (req, res) => {
  try {
    const { tag, name } = req.query;
    const filter = {};
    if (tag) filter.tag = tag;
    if (name) filter.name = name;
    const videos = await ExerciseVideo.find(filter).sort({ name: 1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch exercise videos', error: error.message });
  }
});

// POST /exercise-videos
router.post('/', async (req, res) => {
  try {
    const { name, tag, details, link } = req.body;
    if (!name || !tag || !details || !link) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const video = new ExerciseVideo({ name, tag, details, link });
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add exercise video', error: error.message });
  }
});

// PUT /exercise-videos/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tag, details, link } = req.body;
    const video = await ExerciseVideo.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Exercise video not found' });
    }
    if (name) video.name = name;
    if (tag) video.tag = tag;
    if (details) video.details = details;
    if (link) video.link = link;
    await video.save();
    res.json(video);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update exercise video', error: error.message });
  }
});

// DELETE /exercise-videos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const video = await ExerciseVideo.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Exercise video not found' });
    }
    await video.deleteOne();
    res.json({ message: 'Exercise video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete exercise video', error: error.message });
  }
});

module.exports = router; 