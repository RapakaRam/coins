const express = require('express');
const Coin = require('../models/Coin');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const router = express.Router();

// All coin routes require authentication
router.use(auth);

// Upload a new coin
router.post('/upload', auth, async (req, res) => {
  try {
    const { continentId, countryId, frontImageBase64, backImageBase64, cropShape } = req.body;

    if (!continentId || !countryId || !frontImageBase64) {
      return res.status(400).json({ message: 'continentId, countryId, and frontImageBase64 are required' });
    }

    const coin = new Coin({
      userId: req.userId,
      continentId,
      countryId,
      frontImageBase64,
      backImageBase64: backImageBase64 || null
    });

    await coin.save();
    res.status(201).json(coin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get summary of countries with coins (must come before /:countryId route)
router.get('/summary', async (req, res) => {
  try {
    // ...existing code...
    // Convert req.userId to ObjectId for aggregation match
    const mongoose = require('mongoose');
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(req.userId);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }
    // Use aggregation to get summary by country
    const aggregation = [
      { $match: { userId: userObjectId } },
      { $group: { _id: '$countryId', count: { $sum: 1 } } },
    ];
    const summary = await Coin.aggregate(aggregation);
    res.json(summary);
  } catch (error) {
    console.error('DEBUG /summary error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single coin by ID
router.get('/coin/:coinId', async (req, res) => {
  try {
    const { coinId } = req.params;
    const coin = await Coin.findOne({ _id: coinId, userId: req.userId });
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }
    res.json(coin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a coin
router.put('/:coinId', async (req, res) => {
  try {
    const { coinId } = req.params;
    const { continentId, countryId, frontImageBase64, backImageBase64 } = req.body;
    
    const coin = await Coin.findOne({ _id: coinId, userId: req.userId });
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    if (continentId) coin.continentId = continentId;
    if (countryId) coin.countryId = countryId;
    if (frontImageBase64) coin.frontImageBase64 = frontImageBase64;
    if (backImageBase64 !== undefined) coin.backImageBase64 = backImageBase64 || null;

    await coin.save();
    res.json(coin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a coin
router.delete('/:coinId', async (req, res) => {
  try {
    const { coinId } = req.params;
    
    const coin = await Coin.findOne({ _id: coinId, userId: req.userId });
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    await Coin.findByIdAndDelete(coinId);
    res.json({ message: 'Coin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get coins for a country (must be last to avoid route conflicts)
router.get('/:countryId', async (req, res) => {
  try {
    const { countryId } = req.params;
    const coins = await Coin.find({ countryId, userId: req.userId }).sort({ uploadedAt: -1 });
    res.json(coins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

