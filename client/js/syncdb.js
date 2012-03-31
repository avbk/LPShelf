var albums = []
var anonId = "";

var base = "http://lulzhack.hydra.uberspace.de/LPShelf/shelf/";
importScripts('constants.js');


function get(page, callback) {
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if(xhr.readyState == xhr.DONE) {
			if (xhr.status == 200 && xhr.responseText != null) 
				json = JSON.parse(xhr.responseText);
			else
				json = null;
			
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
			
			get('get/'+ anonId +'/0', function (code, result) {
				if (code == 304) {
					//nop
				} else {
					if (result.length == 0)
						notify(MSG.NO_ALBUMS, null);
					else {
						del = []
						add = []
						for (i = 0; i < result.length; i++)
							if (!result[i] in albums)
								add.push(result[i]);
						for (i = 0; i < albums.length; i++)
							if (!albums[i] in result)
								del.push(albums[i]);
						albums = result;
						
						for (i = 0; i < del.length; i++)
							notify(MSG.ALBUM_DROPPED, del[i]);
						for (i = 0; i < add.length; i++)
							notify(MSG.ALBUM_DROPPED, add[i]);
					}
				}
			});
			
		break;
	}
});