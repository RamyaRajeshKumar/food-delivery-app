const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/geocode", async (req, res) => {
  const { city } = req.query;

  if (!city) return res.status(400).json({ error: "City is required" });

  try {
    const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.LOCATIONIQ_KEY}&q=${city}&format=json`;

    const response = await axios.get(url);

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    const { lat, lon, display_name } = response.data[0];

    res.json({ lat, lon, address: display_name });
  } catch (err) {
    res.status(500).json({ error: "LocationIQ API error" });
  }
});

module.exports = router;
