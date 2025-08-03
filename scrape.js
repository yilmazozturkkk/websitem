const fs = require('fs');

// Örneğin uçuş verisi 'ucuslar' değişkeninde
fs.writeFileSync('output.json', JSON.stringify(ucuslar, null, 2));
