function DB () {
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
     * Gets all album IDs as one list
     * 
	 * @return				the list of saved albums
     */
    this.listIDs = function() {return []}
    
    
    /**
     * Check wheter an album is in the database or not
     * 
     * @param album         the Album
     * @return              true, if album is in database
     */
    this.contains = function(album) {
        return false;
    };
}


function LocalStorageDB() {
    this.put = function(album){
        if (!this.contains(album))
            localStorage[__toID(album)] = true;    
		
		return __toURI(album);
    }
    
    this.drop = function(album){
        if (this.contains(album))
            delete localStorage[__toID(album)];
		
		return __toURI(album);
    }
    
    this.foreach = function(callback) {
        for (var id in localStorage)
            models.Album.fromURI(__toURI(id), callback);
    }
 
	this.listIDs = function() {
		result = [];
		for (var id in localStorage)
			result.push(id);
		
		return result;
	}
	
    this.contains = function(album) {
        return __toID(album) in localStorage;
    };
}
LocalStorageDB.prototype = new DB();