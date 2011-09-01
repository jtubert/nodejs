var socket = io.connect('http://localhost:8080/');
//var socket = io.connect('http://thedrawingroom.no.de/');
//var socket = io.connect('http://nodejs.jtubert.cloud9ide.com/');
var drawLayer;		
var ctx;		
var lineColor = "#000000";		

var remoteLayerArray = {};
var remoteCtxArray = {};
var cursorsArray = {};
var zindex = 0;

var canvasW=window.innerWidth;
var canvasH=window.innerHeight;

//socket.socket.sessionid



window.fbAsyncInit = function() {
 	FB.init({appId: "159663177449942", status: true, cookie: true, xfbml: true}); 
}; 

function login(){
    FB.api('/me', function(response) {
        document.getElementById('login').style.display = "block";
        document.getElementById('login').innerHTML = response.name + " succsessfully logged in!";
    });
}

function sendSocketMessage(name,object){
	//console.log(socket.clients().length);
	socket.emit(name, object);
}

function init(){
	drawLayer = document.getElementById('drawLayer');		
	ctx = drawLayer.getContext('2d');
    ctx.canvas.width  = canvasW;
    ctx.canvas.height = canvasH;
    
    var backDrawLayer = document.getElementById('backg');    	
	var backctx = backDrawLayer.getContext('2d');
    backctx.canvas.width  = canvasW;
    backctx.canvas.height = canvasH;
	
	//drawLayerRemote = document.getElementById('drawLayerRemote');		
	//ctxRemote = drawLayerRemote.getContext('2d');
	
	drawBackg();
	drawLayer.addEventListener('mousedown', onMouseDown, false);		
	drawLayer.addEventListener('mouseup', onMouseUp, false);
	
	$('#nickname').focus();	
}

hex_to_decimal = function(hex) {
	return Math.max(0, Math.min(parseInt(hex, 16), 255));
};
css3color = function(color, opacity) {
	return 'rgba('+hex_to_decimal(color.substr(0,2))+','+hex_to_decimal(color.substr(2,2))+','+hex_to_decimal(color.substr(4,2))+','+opacity+')';
};

			
function drawBackg(){
	var backgctx = document.getElementById('backg').getContext('2d');
	backgctx.fillStyle = css3color("DDDDDD",1);
	backgctx.fillRect(0,0,canvasW,canvasH);				
}			
function onMouseDown(e){
	var x = e.clientX-drawLayer.offsetLeft;
	var y = e.clientY-drawLayer.offsetTop;
	ctx.lineWidth = 3;
	ctx.strokeStyle = lineColor;
	ctx.beginPath();
	ctx.moveTo(x,y);
	drawLayer.addEventListener('mousemove', onMove, false);	
	
	sendSocketMessage('down', { x:x,y:y,lc:lineColor});	
}

function createCanvasObject(nickname,socketID){
	zindex++;
	remoteLayerArray[socketID] = $("<canvas style='z-index:" + zindex + "' id='" + socketID + "'></canvas>").appendTo("#drawModule");
	remoteLayerArray[socketID].nickname = nickname;		
	var layer = document.getElementById(socketID);
    remoteCtxArray[socketID] = layer.getContext("2d");	

	cursorsArray[socketID] = $("<div style='position:absolute;z-index:"+(1000+zindex)+"' id='" + socketID + "'><span class='mouse'></span><div class='nickname'>"+nickname+"</div></div>").appendTo("#drawModule");

	//$("#users").html("Number of connected users: "+(zindex+1));
}

function onMouseDownRemote(x,y,lc,nickname,socketID){
	if(!remoteLayerArray[socketID]){
		createCanvasObject(nickname,socketID);
	}
	
	cursorsArray[socketID].show();
	
	remoteCtxArray[socketID].lineWidth = 3;
	remoteCtxArray[socketID].strokeStyle = lc;
	remoteCtxArray[socketID].beginPath();
	remoteCtxArray[socketID].moveTo(x,y);
}	

function erase(){
	ctx.clearRect(0,0,canvasW,canvasH);	
	for (socketID in remoteCtxArray){
		remoteCtxArray[socketID].clearRect(0,0,canvasW,canvasH);
	}
}	

function eraseAll(){
	erase();
	sendSocketMessage('erase', {});						
}

function eraseAllRemote(){
	erase();
}

function onMouseUp(e){
	drawLayer.removeEventListener('mousemove', onMove,false);
	sendSocketMessage('mouseup', {});					
}

function onMouseUpRemote(nickname,socketID){
	cursorsArray[socketID].hide();
}			

function onMove(e) {				
	var x = e.clientX-drawLayer.offsetLeft;
	var y = e.clientY-drawLayer.offsetTop;				
	ctx.lineTo(x,y);						
	ctx.stroke();
	
	sendSocketMessage('move', {x:x,y:y});							
}

function addMsg(user,msg,color){
    $(".chat").append('<span style="color:'+color+'" class="msg">'+user+': '+msg+'</span><br>');
}

function sendMsg(){
    sendSocketMessage('sendMsg', {msg:$("#msg").val()});
    addMsg('me',$("#msg").val(),"#000000");    
}

function onSend(event){ 
     onReturnKeyPress(event,sendMsg);
}

function onMoveRemote(x, y,nickname,socketID){			
	remoteCtxArray[socketID].lineTo(x,y);						
	remoteCtxArray[socketID].stroke();
	
	cursorsArray[socketID].css("left",x+"px");
	cursorsArray[socketID].css("top",y+"px");
}


function createColorChips(){
	$(".chip").each(function(){
	    //console.log("createColorChips: "+$(this).attr("color"));
		$(this).css("background-color",$(this).attr("color"));
		$(this).css("border-style","solid");
		$(this).css("border-width","1px");
		$(this).css("border-color",$(this).attr("color"));				
		$(this).show();
	});			
	$(".chip").click(function(){
		var otherContents = $(this).parent().find(".chip").not($(this));		
		
		$(this).css("border-color","#000000");
		
		otherContents.css("border-color","#DDDDDD");
				
		
		lineColor = $(this).attr("color");
		
	});
}

function onReturnKeyPress(event,callback){
	var iAscii; 
     if (event.keyCode) 
         iAscii = event.keyCode; 
     else if (event.which) 
         iAscii = event.which; 
     else 
         return false; 

     if (iAscii == 13) callback(); 

     return true;
}

function onJoin(event){
	onReturnKeyPress(event,join);
}

function join(event){
	var n = $("#nickname").val();
	
	if(n.length > 0){
		if(n.length > 40){
			alert("Nickname is too long!");
		}else{
			sendSocketMessage("setName", $("#nickname").val());
			$("#joinModule").hide();
			$("#drawModule").show();
            $(".chat").show();
			//$("#users").html("Number of connected users: 1");
			
		}				
	}else{
		alert("enter a nickname!");
	}			
}

$(document).ready(function(){			
	init(); 
	createColorChips();
	
	console.log("onReady");
	
	socket.on('down', function (data) {
		//console.log(data);
		onMouseDownRemote(data.draw.x, data.draw.y, data.draw.lc,data.nickname,data.socketID);
	});
	
	socket.on('mouseup', function (data) {
		//console.log(data);
		onMouseUpRemote(data.nickname,data.socketID);
	});
	
	socket.on('move', function (data) {
		//console.log(data);
		onMoveRemote(data.draw.x, data.draw.y,data.nickname,data.socketID);
	});
	
	socket.on('erase', function (data) {
		eraseAllRemote();
	});
    
    socket.on('sendMsg', function (data) {
        addMsg(data.nickname,data.draw.msg,"#FF0000");
	});
	
	socket.on('connect', function (data) {
		if(data && data.connections){
			$("#users").html("Number of connected users: "+data.connections);
		}				
	});
});