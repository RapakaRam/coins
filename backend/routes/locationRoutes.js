const express = require('express');
const Location = require('../models/Location');
const router = express.Router();

// Create a continent
router.post('/continent', async (req, res) => {
  try {
    const { name, displayOrder } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const continent = new Location({
      name,
      type: 'continent',
      parent: null,
      displayOrder: displayOrder || 0
    });

    await continent.save();
    res.status(201).json(continent);
  } catch (error) {
    console.error('Create continent error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a country
router.post('/country', async (req, res) => {
  try {
    const { name, continentId } = req.body;

    if (!name || !continentId) {
      return res.status(400).json({ message: 'Name and continentId are required' });
    }

    const continent = await Location.findById(continentId);
    if (!continent || continent.type !== 'continent') {
      return res.status(400).json({ message: 'Invalid continent' });
    }

    const country = new Location({
      name,
      type: 'country',
      parent: continentId
    });

    await country.save();
    res.status(201).json(country);
  } catch (error) {
    console.error('Create country error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all continents (in display order)
router.get('/continents', async (req, res) => {
  try {
    const continents = await Location.find({ type: 'continent' }).sort({ displayOrder: 1 }).lean();
    res.json(continents);
  } catch (error) {
    console.error('Get continents error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Search countries by name (case-insensitive, partial match)
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.json([]);
    }
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const results = await Location.find({ type: 'country', name: regex })
      .sort({ name: 1 })
      .limit(20)
      .select('_id name parent')
      .lean();
    res.json(results);
  } catch (error) {
    console.error('Search countries error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get countries for a continent (must come before /:id route)
router.get('/:continentId/countries', async (req, res) => {
  try {
    const { continentId } = req.params;
    const countries = await Location.find({ type: 'country', parent: continentId }).sort({ name: 1 }).lean();
    res.json(countries);
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a location by ID (must be last to avoid route conflicts)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

