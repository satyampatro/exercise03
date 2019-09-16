const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
    res.end("Service is live.");
});

// Campaign Controllers
require("./api/film_location.api")(router);

module.exports = router;
