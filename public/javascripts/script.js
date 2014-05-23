 $(function(){
	var url = 'http://' + window.location.host;
	
	var doc = $(document);
	var win = $(window);
	var canvas = $('#paper');
	var character = $('#character');
	var bubble = $('#bubble');
	var instructions = $('#instructions');
	var connections = $('#connections');
	var chat = $('#chat');
	//var ctx = canvas[0].getContext('2d');
	
	var id = Math.round($.now()*Math.random());
	
	
	var cursors = {};
	var clients = {};
	var bubbles = {};
	var prev = {};
	var lastEmit = $.now();
	
	var socket = io.connect(url);
	
	/*
	Administradores de eventos
	*/
	function moveHandler(data) {
		if(! (data.id in clients)){
			cursors[data.id] = $('<div class="character">').appendTo('#paper');
			bubbles[data.id] = $('<div class="bubble">').appendTo('#paper');
		}
		
	
		cursors[data.id].css('display', 'block').animate({
		  'left' : data.x,
		  'top' : data.y
		}, 'slow');
		
	
		clients[data.id] = data;
		clients[data.id].updated = $.now();
	}
	
	function chatHandler(data) {
		if(data.id in clients){
			var character = cursors[data.id], bubble = bubbles[data.id], tm = null;
			if (tm = jQuery.data(bubble, 'timeout'))
				clearTimeout(tm);
			
			bubble.css({'left': character.position().left-50, 'top': character.position().top-30}).fadeIn();
			bubble.html(data.chat);
			jQuery.data(bubble, 'timeout', setTimeout(function() {
				bubble.fadeOut();
			}, 3000));
		}
	}
	
	function keyupHandler(e) {
		if (character.css('display') == 'none') {
			var left = 1 + Math.floor(Math.random() * canvas.width()), 
				top = 1 + Math.floor(Math.random() * canvas.height());
			character.css({'left': left, 'top': top, 'display': 'block'});				
			instructions.hide();
			
			socket.emit('cmove', {'id': id, 'x': left, 'y': top});
			lastEmit = $.now();
		}
		
		//if($.now() - lastEmit > 30)
		if (e.keyCode > 36 && e.keyCode < 41)
		{
			var pos = character.position(), x = pos.left, y = pos.top;
			var d = 40;
			switch (e.keyCode) {
				case 38: // UP
				y-=d;
				break;
				case 40: // DOWN
				y+=d;
				break;
				case 37: // LEFT
				x-=d;
				break;
				case 39: // RIGHT
				x+=d;
				break;
			}
			
			var movement = {
				'x': x,
				'y': y,
				'id': id
			};
			
			character.animate({'top': y, 'left': x}, 'slow');
			
			socket.emit('cmove', movement);
			lastEmit = $.now();
		}
		
		e.stopPropagation();
		e.preventDefault();
		return false;
	}
	
	function connectionHandler(data) {
		console.log('connections', connections);
		//connections.text(data.connections + ' connectados');
	}
	
	socket.on('move', moveHandler);
	socket.on('chat', chatHandler);
	socket.on('connections', connectionHandler);
	// canvas.on('mousedown', mousedownHandler);
	doc.on('keyup', keyupHandler);
	
	chat.on('keyup', function(e) {
		if (e.keyCode == 13) {
			var tm = null;
			if (tm = jQuery.data(bubble, 'timeout'))
				clearTimeout(tm);
			var val = chat.val();
			chat.val('');
			bubble.css({'left': character.position().left-50, 'top': character.position().top-30}).fadeIn();
			bubble.html(val);
			jQuery.data(bubble, 'timeout', setTimeout(function() {
				bubble.fadeOut();
			}, 3000));
			
			var data = {
				'chat': val,
				'id': id
			};
			
			socket.emit('cchat', data);
			return false;
		}
	});
	
	/*doc.bind('mouseup mouseleave',function(){
		drawing = false;
	});*/
	setInterval(function()
	{
		for(var ident in clients)
		{
			if($.now() - clients[ident].updated > 30000)
			{
				cursors[ident].remove();
				delete clients[ident];
				delete cursors[ident];
			}
		}
	},10000);

});