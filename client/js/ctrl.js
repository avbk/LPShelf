var Controller = function () {
    worker = new Worker('js/syncdb.js');
    localDB = new LocalStorageDB();

    noAlbums       = null;
    albumAdded     = null;
    albumDropped   = null;
        
    worker.onmessage = function (event) {
        msg = event.data;
		
        switch(msg.id) {
            case MSG.LOG:
                console.log(msg.data);
                break;
            case MSG.NO_ALBUMS:
                if (noAlbums)
                    noAlbums();
                break;
            case MSG.ALBUM_ADDED:
                albumURI = localDB.put(msg.data);
                if (albumAdded)
                    models.Album.fromURI(albumURI, albumAdded);
                break;
            case MSG.ALBUM_DROPPED:
                albumURI = localDB.drop(msg.data);
                if (albumDropped)
                    models.Album.fromURI(albumURI, albumDropped);
                break;
        }
    }
	
    this.put = function(album) {
        worker.postMessage({
            'id' : CMD.ADD_ALBUM,
            'data': __toID(album)
        });
    }
	
    this.drop = function(album) {
        worker.postMessage({
            'id' : CMD.DROP_ALBUM,
            'data': __toID(album)
        });
    }
	
    this.init = function() {
        worker.postMessage({
            'id' : CMD.INIT,
            'data': {
                'albums' : localDB.listIDs(),
                'anonId' : models.session.anonymousUserID
            }
        });
    }
        
    this.refresh = function() {
        worker.postMessage({
            'id' : CMD.REFRESH,
            'data': null
        });
    }
	
        
    this.setNoAlbumsCallback = function (callback) {
        noAlbums = callback;
    }
    
    this.setAlbumAddedCallback = function (callback) {
        albumAdded = callback;
    }
    this.setAlbumDroppedCallback = function (callback) {
        albumDropped = callback;
    }
}