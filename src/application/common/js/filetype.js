/***
 *  可以使用的 icon-class
 */
const types = {
    jpg: "jpg",
    jpeg: "jpg",
    png: "jpg",
    zip: "zip",
    rar: "rar",
    avi: "avi",
    raw: "raw",
    xls: "xls",
    xlsx: "xls",
    doc: "word",
    docx: "word",
    ppt: "ppt",
    pptx: "ppt",
    psd: "ps",
    txt: "txt",
    ttf: "ttf",
    wav: "wav",
    mov: "mov",
    mp4: "mov",
    mp3: "mp3",
    pdf: "pdf",
    eps: "eps",
    html: "html",
    ai: "ai",
    torrent: "bt",
    css: "css"
}

function getIconClass(filename, isDir) {
    let iconclass = 'qita';
    if (isDir) {
        iconclass = 'wenjianjia';
    } else {
        let components = (filename || '').split('.');
        let ext = components[components.length-1].toLowerCase();
        if (types[ext]) {
            iconclass = types[ext];
        }
    }
    return iconclass;
}

module.exports = {
    getIconClass
};

