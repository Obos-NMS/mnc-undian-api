module.exports = {
    getVideoIdYoutube: (url) => {
        var regex = /[?&]v=([^&]+)/i;
        var regexShort = /youtu\.be\/([^&]+)/i;

        var match = url.match(regex);
        var matchShort = url.match(regexShort);
        if (match && match[1]) {
            return match[1];
        } else if (matchShort && matchShort[1]) {
            return matchShort[1];
        } else {
            return null;
        }
    }
}