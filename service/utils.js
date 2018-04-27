
function removeLastSlash(uri){
    if(!uri || !uri.endsWith('/')){
        return uri;
    }
    return uri.substring(0,uri.length -1);
}

module.exports = {
    urls:{
        removeLastSlash:removeLastSlash
    }
};