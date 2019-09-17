let filmLocationModule = require('../modules/film_location')

module.exports = function (router) {
    router.post('/get_film_location', async function (req, res) {
        try {
            let queryString = req.body.locationQueryString;
            let longitude = req.body.longitude;
            let latitude = req.body.latitude;

            let result = await filmLocationModule.fetchFilmLocations(queryString, longitude, latitude);
            if (result.length > 0) {
                res.json({
                    success: true,
                    data: result
                })
                return;
            }
            res.json({ success: false, message: 'No Data Found.' })
        } catch (e) {
            res.status(500);
            console.error(e);
            res.json({
                success: false,
                message: "Internal Error"
            })
        }
    })

    router.post('/get_film_suggestions', async function (req, res) {
        try {
            let queryString = req.body.locationQueryString;

            let result = await filmLocationModule.fetchFilmSuggestions(queryString);
            if (result.length > 0) {
                res.json({
                    success: true,
                    data: result
                })
                return;
            }
            res.json({ success: false, message: 'No Data Found.' })
        } catch (e) {
            res.status(500);
            console.error(e);
            res.json({
                success: false,
                message: "Internal Error"
            })
        }
    })

    return router;
}