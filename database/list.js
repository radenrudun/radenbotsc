// file: lib/list.js
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../database/list.json');

let database = {};
if (fs.existsSync(filePath)) {
  database = JSON.parse(fs.readFileSync(filePath));
} else {
  fs.writeFileSync(filePath, JSON.stringify({}));
}

function saveDatabase() {
  fs.writeFileSync(filePath, JSON.stringify(database, null, 2));
}

module.exports = { database, saveDatabase };