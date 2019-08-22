const fs = require('fs');

const filePath = process.argv.slice(2)[0];
const json = fs.readFileSync(filePath);
const parsed = JSON.parse(json);

return parsed;