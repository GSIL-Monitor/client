/***
 *  对象转字符串
 *  1). 由于 JSON.stringify 在 render 与 main 进程不能保证转换时 key 的顺序一致, 因此需要将对象的 key 进行排序后转换成字符串 
 * 	2). 使用 ipc 通信参数为空时, 在 render 中为 undefined, 在 main 中为 null, 因此将这两种类型的数据都过滤掉
 *  @param {Object} obj 对象
 *  @returns {String} 转换后的字符串
 */
function stringify(obj) {
	let str = '';
	if (obj instanceof Array) {
		str += '[';
		str += obj.map(value => {
			return stringify(value); 
		}).join(',');
		str += ']';
	} else if (obj instanceof Object) {
		str += '{'
		str += Object.keys(obj).sort().filter(key => {
			let value = obj[key];
            return value !== undefined && value !== null;
        }).map(key => {
			return `"${key}":${stringify(obj[key])}`;
		}).join(',');
		str += '}'
	} else if (typeof obj === 'string') {
		str += `"${obj}"`;
	} else if (obj !== undefined && obj !== null) {
        str += obj;
    }
	return str;
}

module.exports = stringify;