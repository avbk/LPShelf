function DB (initCallback) {
    /**
     * Put an album into the database
     * 
     * @param album         the Album
     */
    this.put = function(album){}
    
    
    /**
     * Drops an album from the database
     * 
     * @param album         the Album
     */
    this.drop = function(album){}
    
    /**
     * Executes a callback on every album in the db with
     * the album as first parameter
     * 
     * @param callback      the callback to execute
     */
    this.foreach = function(callback) {}
    
    
    /**
     * Check wheter an album is in the database or not
     * 
     * @param album         the Album
     * @return              true, if album is in database
     */
    this.contains = function(album) {
        return false;
    };
    
    if (initCallback != null)
        window.setTimeout(initCallback, 0);
}


function LocalStorageDB(initCallback) {
    var albumPrefix = "spotify:album:";
    
    this.put = function(album){
        if (!this.contains(album))
            localStorage[album.uri.substr(albumPrefix.length)] = true;    
    }
    
    this.drop = function(album){
        if (this.contains(album))
            delete localStorage[album.uri.substr(albumPrefix.length)];
    }
    
    this.foreach = function(callback) {
        for (var id in localStorage)
            models.Album.fromURI(albumPrefix+id, callback);
    }
 
    this.contains = function(album) {
        return album.uri.substr(albumPrefix.length) in localStorage;
    };
    
    if (initCallback != null)
        window.setTimeout(initCallback, 0);
}
LocalStorageDB.prototype = new DB();




function PlaylistDB(initCallback) {
    var __playlist;
    
    this.put = function(album){
        if (!this.contains(album))
            __playlist.add(album.tracks[0]);
    }
    
    this.drop = function(album){
        if (this.contains(album))
            __playlist.remove(album.tracks[0]);
    }
    
    this.foreach = function(callback) {
        // TODO __playlist.tracks is kind of deprecated, but why?
        for (track in __playlist.tracks)
            callback(track.album);
    }
 
    this.contains = function(album) {
        /**
         *
         *   return __playlist.indexOf(album.tracks[0]) > -1;
         * TODO: sadly Playlist.indexOf always returning -1;
         * So using bad O(n)-worst-case implementation
         */
        uri = album.tracks[0].uri;
        for (track in __playlist.tracks)
            if (uri == track.uri)
                return true;
        
        return false;
    };
    
    
    __createNewPlaylist = function() {
        __playlist = new models.Playlist(".lpshelf");
        
        if (initCallback != null)
            window.setTimeout(initCallback, 0);
    }
    
    if ("playlist" in localStorage) {
        try {
            models.Playlist.fromURI(localStorage["playlist"], initCallback);
        } catch(err) {
            __createNewPlaylist();
        }
    } else 
        __createNewPlaylist();
    
}
PlaylistDB.prototype = new DB();