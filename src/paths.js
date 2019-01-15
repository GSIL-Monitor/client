const pathMoudle = require('path');
const urlMoudle = require('url');

//项目根目录
const productURL = urlMoudle.format({
    pathname: pathMoudle.join(__dirname, '/../'),
    protocol: 'file:',
    slashes: true
});





module.exports = {
    productURL
}