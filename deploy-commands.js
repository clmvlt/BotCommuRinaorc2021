const teams = require("./data/teams.json");
var tabTeam = teams.flatMap(t=>t.nom);
require('./dep')(tabTeam);