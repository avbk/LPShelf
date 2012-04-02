MSG = {
	LOG : 1,
	NO_ALBUMS : 2,
	ALBUM_ADDED : 3,
	ALBUM_DROPPED : 4,
	LAST_UPDATE: 5
}

CMD = {
	INIT : 1,
	ADD_ALBUM : 2,
	DROP_ALBUM : 3,
        REFRESH : 4
}

 
albumPrefix = "spotify:album:";

__toID = function(album) {
	if (typeof album == "string") {
		if (album.indexOf(':') > -1)
			return album.substr(albumPrefix.length);
		else
			return album;
			
	} else
		return album.uri.substr(albumPrefix.length);
}

__toURI = function(id) {
	if (typeof id == "string") {
		if (id.indexOf(':') > -1)
			return id;
		else
			return albumPrefix + id;
			
	} else
		return album.uri;
}