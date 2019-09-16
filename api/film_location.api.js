let filmLocationModule = require('../modules/film_location')

module.exports = function (router) {
    router.post('/getFilmLocation', async function () {
        try {
            let queryString = req.body.query;

            let result = await filmLocationModule.fetchFilmLocations(queryString);
            if (result) {
                res.json({
                    success: true,
                    data: result
                })
                return;
            }
            res.json({ success: false })
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