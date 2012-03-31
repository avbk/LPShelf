var Controller = function () {
	worker = new Worker('js/syncdb.js');
	localDB = new LocalStorageDB();
	
	worker.onmessage = function (event) {
		msg = event.data;
		
		switch(msg.id) {
			case MSG.LOG:
				console.log(msg.data);
				break;
			case MSG.NO_ALBUMS:
				if (this.noAlbums)
					this.noAlbums();
				break;
			case MSG.ALBUM_ADDED:
				albumURI = localDB.put(msg.data);
				if (this.albumAdded)
					this.albumAdded(albumURI);
				break;
			case MSG.ALBUM_DROPPED:
				albumURI = localDB.drop(msg.data);
				if (this.albumDropped)
					this.albumDropped(albumURI);
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
	
}