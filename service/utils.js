
function removeLastSlash(uri){
    if(!uri || !uri.endsWith('/')){
        return uri;
    }
    return uri.substring(0,uri.length -1);
}

function sureEndsWithSlash(uri){
    if(!uri.endsWith('/')){
        uri += '/';
    }
    return uri;
}

function resoleUri(start, end) {
    var uri = null;
    if (!start.endsWith('/')) {
        start = start + '/';
    }
    if (end.startsWith('/')) {
        end = end.substring(1);
    }
    uri = start + end;
    return uri;
}


module.exports = {
    urls:{
        removeLastSlash:removeLastSlash,
        sureEndsWithSlash:sureEndsWithSlash,
        resoleUri:resoleUri
    }
};