const path = require('path');
const platform = process.platform; // 'darwin', 'win32', 'linux'

let native;
try {
  native = require(`./dist/${platform}.node`);
} catch (error) {
  throw new Error(`Platform ${platform} not supported: ${error.message}`);
}

module.exports = native;
