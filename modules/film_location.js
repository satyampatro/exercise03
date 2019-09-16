let request = require('request-promise')

exports.fetchFilmLocations = async function (queryString) {

}

exports.updateFilmLocations = async function () {
    var options = {
        method: 'GET',
        uri: 'https://data.sfgov.org/resource/yitu-d5am.json',
        json: true
    };

    let result = await request(options);
    console.log(result.length);
}