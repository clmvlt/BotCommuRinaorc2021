const config = require('./../data/config.json');
const fetch = require('node-fetch');

module.exports = function () {

    function get(path) {
        return fetch('https://api.rinaorc.com' + path, {
           method: "GET",
           headers: {
            "API-Key": config.apikey
           }
        }).then(response => {
           return response.json();
        }).then(json => {
           return json;
        });
    }

    this.getPlayer = async function(player) {
        return await get(`/player/${player}`);
    }

    this.getLeaderboards = async function() {
        return await get(`/leaderboards`);
    }
}