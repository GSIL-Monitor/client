/***
 *  时间戳格式化
 *  @param {Number} timestamp 时间戳(单位: s)
 *  @returns {String} 格式化 yyyy-mm-dd 字符串
 */
function timestampToString(timestamp) {
    let date = new Date(timestamp * 1000);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    return year + '-' + month + '-' + day;
}

function dateToString(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    return year + '-' + month + '-' + day;
}

module.exports = {
    timestampToString,
    dateToString
};