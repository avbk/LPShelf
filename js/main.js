function ERR(s) {
	console.log("ERROR: " + s);
	
}

var albumPrefix = "spotify:album:";

var sp;
var models;
var views;
var ui;

function button(value, type, caption, css) {
	return $('<button class="'+css+' sp-button sp-icon" value="'+value+'"><span class="sp-'+type+'"></span>'+caption+'</button>');
} 

$(function() {
	sp = getSpotifyApi(1);
	models =  sp.require('sp://import/scripts/api/models');
	views =  sp.require('sp://import/scripts/api/views');
	ui = sp.require('sp://import/scripts/dnd');
	
	models.application.observe(models.EVENT.ACTIVATE, function() {
	});
	
	models.application.observe(models.EVENT.LINKSCHANGED, function() {
		for (var i = 0; i < models.application.links.length; i++)
			handleImport(models.application.links[i]);
	});
	
	for (var id in localStorage) {
		models.Album.fromURI(albumPrefix+id, drawAlbum);
	}
	
})

function onButtonPlayClick() {
	models.player.play($(this).parent().find('album a').attr('href'));
}

function onButtonDropClick() {
	albumURI = $(this).parent().find('album a').attr('href');
	id = albumURI.substr(albumPrefix.length);
	delete localStorage[id];
	$(this).parent().remove();
}

function createHTML(album) {
	img = $((new views.Image(album.data.cover)).node);
	
	btn = button(album.uri, 'minus', 'Drop', 'drop');
	btn.click(onButtonDropClick);
	img.append(btn);
	img.append('\
		<albumInfo>\n\
			<album class="left-bound"><a href="'+album.uri+'">' +album.name+'</a></album>\n\
			<year>'+album.data.year+'</year>\n\
			<artist class="left-bound"><a class="creator" href="'+album.data.artist.uri+'">'+album.data.artist.name+ '</a></artist>\n\
			<buttonPlay class="right-bound" />\n\
		</albumInfo>');
	
	img.find('buttonPlay').click(onButtonPlayClick);
	return img;
} 

function drawAlbum(album) {
	img = createHTML(album);
	imgs = $('div.sp-image');
	
	artistName = album.data.artist.name.toUpperCase();
	albumYear  = album.data.year;
	
	for (i = 0; i < imgs.length; i++) {
		otherArtistName = $(imgs[i]).find('artist a').text().toUpperCase();
		
		if (artistName < otherArtistName) {
			$(imgs[i]).before(img);
			return;
		} else if (artistName == otherArtistName) {
			otherAlbumYear = Number($(imgs[i]).find('year').text());
			if (albumYear < otherAlbumYear) {
				$(imgs[i]).before(img);
				return;
			}
		}
	}
	
	$('body').append(img);
}

function handleArtistImport(artist) {
	
	$.get('http://ws.spotify.com/lookup/1/.json?uri='+artist.uri+'&extras=album', function(metadata) {
		for (i = 0; i < metadata.artist.albums.length; i++) {
			if (metadata.artist.albums[i].album.availability.territories.indexOf('US') > -1)
				models.Album.fromURI(metadata.artist.albums[i].album.href, handleAlbumImport);
		}
	});

	ERR("Due to a bug, the artist albums are fetched via metadata api");
	
	return;
	artist.getAlbums(function(albums) {
		console.log(albums);
	});
}

function handleAlbumImport(album) {
	id = album.uri.substr(albumPrefix.length);
	if (!(id in localStorage)) {
		localStorage[id] = true;
		drawAlbum(album);
	}
}

function handleImport(spotifyURL) {
	var link;
	
	try {
		link = new models.Link(spotifyURL);
	} catch (err) {
		ERR("Not a valid spotify link!");
		return;
	}
	
	switch (link.type) {
		case models.Link.TYPE.ARTIST:
			models.Artist.fromURI(link.uri, handleArtistImport);
			break;
		case models.Link.TYPE.ALBUM:
			models.Album.fromURI(link.uri, handleAlbumImport);
		beak;
			
		default:
			ERR("Unsupported spotify link!");
			return;
				
	}
}