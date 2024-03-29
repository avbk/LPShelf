function ERR(s) {
    console.log("ERROR: " + s);
}

var sp;
var models;
var views;
var ui;
var templateEngine;
var db;
var ctrl;


function button(value, type, caption, css) {
    return $('<button class="'+css+' sp-button sp-icon" value="'+value+'"><span class="sp-'+type+'"></span>'+caption+'</button>');
}

function init() {
    inits = [
    function() {
        templateEngine = new TemplateEngine('/tpl', ['album'], step);
    },
    function() {
        db = new LocalStorageDB();
        step();
    }
    ]
    cursor = 0;
    
    
    step = function () {
        if (cursor < inits.length) 
            inits[cursor++]();
        else {
            // POST init
			
            models.application.observe(models.EVENT.ACTIVATE, function() {
                ctrl.refresh();
            });

            models.application.observe(models.EVENT.LINKSCHANGED, function() {
                for (var i = 0; i < models.application.links.length; i++)
                    handleImport(models.application.links[i]);
            });

            db.foreach(drawAlbum);      
			
            ctrl = new Controller();
            ctrl.setNoAlbumsCallback(function() {
                console.log("TODO: EMPTY DB, PROVIDE INITIAL DATA");
            });
            ctrl.setAlbumAddedCallback(drawAlbum);
            ctrl.setAlbumDroppedCallback(function(album) {
                console.log("TODO: DELTE ALBUM");
                // not implemented due to incomplete design
            });
            
            ctrl.init();
        }
    }
    step();
}

$(function() {
    sp = getSpotifyApi(1);
    models =  sp.require('sp://import/scripts/api/models');
    views =  sp.require('sp://import/scripts/api/views');
    ui = sp.require('sp://import/scripts/dnd');
    
    init();
})

function onButtonPlayClick() {
    models.player.play($(this).parent().find('album a').attr('href'));
}

function onButtonDropClick() {
    albumURI = $(this).parent().find('album a').attr('href');
    models.Album.fromURI(albumURI, db.drop);
    
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
    // OLD Creation
    //img = createHTML(album);
    img = templateEngine.load("album", {
        album: album
    });
        
    imgs = $('li.shelfItem');
        
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

    $('#shelf').append(img); 
    // FIXME: this could be done better
    $('buttonPlay').click(onButtonPlayClick);
}

function handleArtistImport(artist) {
	
    $.get('http://ws.spotify.com/lookup/1/.json?uri='+artist.uri+'&extras=album', function(metadata) {
        for (i = 0; i < metadata.artist.albums.length; i++) {
            if (metadata.artist.albums[i].album.availability.territories.indexOf(models.session.country) > -1)
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
    ctrl.put(album);
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
