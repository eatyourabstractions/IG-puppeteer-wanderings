const fs = require('fs')

function readThat(afile){
   return fs.readFileSync(afile, 'utf8')
}

exports.readThat = readThat