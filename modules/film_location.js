let request = require('request-promise')
let Promise = require('bluebird');
let uniqid = require('uniqid');
var NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.google_map_api_key,
    formatter: null
};
var geocoder = NodeGeocoder(options);

exports.fetchFilmLocations = async function (queryString, longitude, latitude) {

    let query = `select * from (\
        select m.title, l.name, (\
            3959 * \
            acos(cos(radians($2)) * \
            cos(radians(l.latitude)) * \
            cos(radians(l.longitude) - \
            radians($1)) + \
            sin(radians($2)) * \ 
            sin(radians(latitude))) \
        ) AS distance from locations l join movies m on m.location_id = l.id \
    ) t where distance < 25 `

    let valueList = [longitude, latitude];
    if (queryString) {
        valueList.push(`%${queryString}%`)
        query += ` and name ilike $${valueList.length}`;
    }

    query += `ORDER BY distance`;
    // execute query
    let result = (await pgInstance.query(query, valueList)).rows;
    return result;
}

exports.fetchFilmSuggestions = async function (queryString) {
    // build where caluse
    let whereCaluse = `WHERE title `;
    let valueList = [];
    if (queryString) {
        whereCaluse += ` ilike $1`;
        valueList.push(queryString + "%");
    } else {
        whereCaluse += `IS NOT NULL`;
    }

    // fetch data
    let query = `SELECT distinct title as value FROM movies ${whereCaluse} \
      ORDER BY value LIMIT 100`;
    console.debug(query)
    let result = (await pgInstance.query(query, valueList)).rows;
    return result;
}

exports.updateFilmLocations = async function (offset) {
    // on every next run of cron
    // first fetch the total count of stored entries
    let totalMoviesCount = 0;
    if (!offset) {
        totalMoviesCount = (await pgInstance.query(`select count(1) from movies`)).rows[0].count;
        // stored data length will be considered as offset for the next api fetch
        offset = parseInt(totalMoviesCount);
    }

    // Fetch 1000 limit batch entries from api
    let limit = 30;
    let datasets = await request({
        method: 'GET',
        uri: `https://data.sfgov.org/resource/yitu-d5am.json?$limit=${limit}&$offset=${offset}`,
        json: true
    });
    if (datasets.error) {
        throw new Error('Datasets api is not working!');
    }

    await Promise.map(datasets, async function (data) {
        if (!data.locations) {
            return;
        }

        let res = await geocoder.geocode({ address: data.locations, city: 'San Francisco' }).catch((e) => {
            console.error(e, data);
            return
        })
        if (!res || (res && res.length <= 0)) {
            return
        }

        let latitude = res[0].latitude;
        let longitude = res[0].longitude;
        // get location info from location string
        // insert city, state, country and location into respective tables
        let cityId = null;
        let countryId = null;
        let result = await Promise.all([
            pgInstance.query(`select * from cities where name = $1`, [res[0].city]),
            pgInstance.query(`select * from countries where name = $1`, [res[0].country])
        ]);

        if (result[0].rows.length > 0) {
            cityId = result[0].rows[0].id;
        } else if (res[0].city) {
            cityId = uniqid();
            await pgInstance.query(`insert into cities (id, name) values($1, $2) on conflict do nothing`, [cityId, res[0].city]).catch((e) => {
                console.error(e);
                throw e;
            })
        }
        if (result[1].rows.length > 0) {
            countryId = result[1].rows[0].id;
        } else if (res[0].country) {
            countryId = uniqid();
            await pgInstance.query(`insert into countries (id, name) values($1, $2) on conflict do nothing`, [countryId, res[0].country]).catch((e) => {
                console.error(e);
                throw e;
            })
        }


        let location = (await pgInstance.query(`select * from locations where longitude = $1 and latitude = $2`,
            [res[0].longitude, res[0].latitude]).catch((e) => {
                console.error(e);
                throw e;
            })).rows;

        let locationId = null;
        if (location.length > 0) {
            locationId = location[0].id;
        } else if (countryId && cityId) {
            locationId = uniqid();
            let query1 = `insert into locations (id, name, country_id, city_id, longitude, latitude) values($1, $2, $3, $4, $5, $6) \
            on conflict do nothing`;
            await pgInstance.query(query1, [locationId, res[0].formattedAddress, countryId, cityId, longitude, latitude]).catch((e) => {
                console.error(e);
                throw e;
            })
        }

        // insert distributor, director, actor, production_company into their respective tables
        let actors = [];
        for (let key in data) {
            if (key.startsWith('actor_')) {
                let result = (await pgInstance.query(`select * from actors where name = $1`, [data[key]])).rows
                if (result.length > 0) {
                    actors.push(result[0].id)
                } else {
                    let actorId = uniqid();
                    actors.push(actorId);
                    await pgInstance.query(`insert into actors (id, name) values($1, $2) on conflict do nothing`, [actorId, data[key]]).catch((e) => {
                        console.error(e);
                        throw e;
                    })
                }
            }
        }

        if (!locationId) {
            return;
        }

        // insert movies and actor_movie_map
        let movieId = uniqid();
        let query = `insert into movies (id, title, release_year, fun_facts, location_id, production_company, distributor, director, writers) values($1, $2, $3, $4, $5, $6, $7, $8, $9) on conflict do nothing`;
        await pgInstance.query(query, [movieId, data.title, data.release_year, data.fun_facts, locationId, data.production_company,
            data.distributor, data.director, data.writers])
            .then(async () => {
                let promises = [];
                for (let i = 0; i < actors.length; i++) {
                    promises.push(pgInstance.query(`insert into actor_movie_map (actor_id, movie_id) values($1, $2) on conflict do nothing`, [actors[i], movieId]))
                }
                await Promise.all(promises);
            })
            .catch((e) => {
                console.error(e);
            })
    }, { concurrency: 3 }).then(function () {
        console.log("Finished creating entries for the batch.");
    });


    if (datasets.length < limit) {
        // if a batch is less than limit then stop the recursion
        console.debug('Creating movies entries is stopped.')
        return;
    }

    offset = offset + limit;
    await module.exports.updateFilmLocations(offset);
}