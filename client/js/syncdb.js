var albums = []
var anonId = "";
var lastUpdate = 0;

var base = "http://lulzhack.hydra.uberspace.de/LPShelf/shelf/";
importScripts('constants.js');


function get(page, callback) {
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if(xhr.readyState == xhr.DONE) {
            json = xhr.responseText != null && xhr.responseText.length > 0 ? JSON.parse(xhr.responseText) : null;
            callback(xhr.status, json);
        }
    }
    xhr.open('GET', base + page, true);
    xhr.send(null);
}

function notify(id, msg) {
    postMessage({
        'id' : id,
        'data' : msg
		
    });
}

function log(data) {
    notify(MSG.LOG, data);
}


self.addEventListener('message', function(event) {
    msg = event.data;
    switch(msg.id) {
        case CMD.INIT:
            albums = msg.data.albums;
            anonId = msg.data.anonId;
			lastUpdate = msg.data.lastUpdate;
        case CMD.REFRESH:	
            get('get/'+ anonId +'/' + lastUpdate, function (code, result) {
                if (code == 204) {
                    //nop
                    if (albums.length == 0)
                        notify(MSG.NO_ALBUMS, null);
                } else {
                    del = [];
                    add = [];
                    if (result.type == 'delta') {
						log("DELTA ONLY");
						for (i = 0; i < result.albums.length; i++)
							if (albums.indexOf(result.albums[i]) == -1) {
								add.push(result.albums[i]);
								albums.push(result.albums[i]);
							}

					} else if (result.type == 'full') {
						log("FULL UPDATE");
						for (i = 0; i < result.albums.length; i++)
							if (albums.indexOf(result.albums[i]) == -1)
								add.push(result.albums[i]);

						if (result.albums.length == 0)
							del = albums;
						else {
							for (i = 0; i < albums.length; i++)
								if (result.albums.indexOf(albums[i]) == -1)
									del.push(albums[i]);
						}
						albums = result.albums;	
					} else
						log("UNKOWN REFRESH TYPE");
                    
                    log("Removing " + del.length + " albums");
                    log("Adding " + add.length + " albums");
                    
                    for (i = 0; i < del.length; i++)
                        notify(MSG.ALBUM_DROPPED, del[i]);
                    for (i = 0; i < add.length; i++)
                        notify(MSG.ALBUM_ADDED, add[i]);
                    if (albums.length == 0)
                        notify(MSG.NO_ALBUMS, null);
                }
                lastUpdate = +new Date;
				notify(MSG.LAST_UPDATE, lastUpdate);
            });	
            break;
        case CMD.ADD_ALBUM:
            albumId = msg.data;
            get('add/'+ anonId +'/' + albumId, function (code, result) {
                if (code == 200) {
                    albums.push(albumId);
                    notify(MSG.ALBUM_ADDED, albumId);
                }
            });
            break;
            
        case CMD.DROP_ALBUM:
            albumId = msg.data;
            get('drop/' + anonId + '/' + albumId, function (code, result) {
                if (code == 200) {
                    albums = albums.splice(albums.indexOf(albumId), 1);
                    notify(MSG.ALBUM_DROPPED, albumId);
                }
            });
            break;
           
    }
});