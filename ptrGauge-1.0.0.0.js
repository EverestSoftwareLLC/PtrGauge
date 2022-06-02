/*
The MIT License (MIT) https://mit-license.org/

Copyright 2022 Everest Software LLC https://www.hmisys.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
associated documentation files (the “Software”), to deal in the Software without restriction, 
including without limitation the rights to use, copy, modify, merge, publish, distribute, 
sub-license, and/or sell copies of the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial 
portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT 
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES 
OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

PtrGauge = function(canvasID, options) {                          

 if ((typeof canvasID === "undefined") || (canvasID === "")) {
  alert("PtrGauge: Make sure to provide an id string.");
  return false;
 }

 var g = {};		//holds properties and other variables
 g.id = canvasID;
 g.cRef = {};
 g.ctx = {};

 if (typeof options === "undefined") 
  options = {};

 g.invert = options.invert ? options.invert : false;

 g.color = options.color ? options.color : "black";
 g.backgroundColor = options.backgroundColor? options.backgroundColor: "white";
 g.ptrPosition = options.ptrPosition ? options.ptrPosition : 0; //0 = left/top 1 = right/bottom
 if (typeof options.ptrSize === "undefined") 
  g.ptrSize = 17;
 else
  g.ptrSize = options.ptrSize;

 if (typeof options.lineWidth === "undefined") 
  g.lineWidth = 0;
 else
  g.lineWidth = options.lineWidth;

 g.mirror = options.mirror ? options.mirror: false;
  
 g.cRef = document.getElementById(g.id);  	//a reference to the canvas
 if (g.cRef) {
  g.ctx = g.cRef.getContext("2d");
  g.ctx.imageSmoothingEnabled = true;
  g.cRef.width = g.cRef.offsetWidth;		//intrinsic and extrinsic need to match 		
  g.cRef.height = g.cRef.offsetHeight; 
  }
 else
  return false;

 g.boundsRect = {left:0, top:0, right:g.cRef.width, bottom: g.cRef.height};					//the outside bounds
 g.isHorz = (g.cRef.width > g.cRef.height)
 g.ptrDiv2 = g.ptrSize / 2;
 
 this.DrawGauge = function(value) {
  if (!g.ctx)
   return;
  
  g.currentValue = value; 
    
  DrawRect(g.ctx,g.backgroundColor,g.boundsRect);			//the complete gauge area
  DrawPointer();											//value indicator
 };			//end of DrawGauge

 this.SetFGColor = function(fgColor){
  g.color = fgColor; 
  };  

  this.SetProperties = function(invert,mirror){
   g.invert = invert; 
   g.mirror = mirror;
  };
  
 function DrawPointer() {									//called from DrawGauge
  var s,y,percent;
  var triangle = [{x:0, y:0},{x:0, y:0},{x:0, y:0}];
  var rRect = {left:0, top:0, right:0, bottom: 0}

  function DrawHorz(){
  
	function DrawBottom() {
	 triangle[0].x = x - g.ptrDiv2;          //left side of pointer
	 triangle[0].y = rRect.bottom;

	 triangle[1].x = x + g.ptrDiv2;          //right side pointeer
	 triangle[1].y = rRect.bottom;

	 triangle[2].x = x;
	 triangle[2].y = rRect.bottom - g.ptrSize;
	 DrawPolygon(g.ctx,g.color,triangle,true,0.5,true);
	};

	function DrawTop() {
	 triangle[0].x = x - g.ptrDiv2;          //left side of pointer
	 triangle[0].y = rRect.top;

	 triangle[1].x = x + g.ptrDiv2;          //right side pointeer
	 triangle[1].y = rRect.top;

	 triangle[2].x = x;
	 triangle[2].y = rRect.top + g.ptrSize;
	 DrawPolygon(g.ctx,g.color,triangle,true,0.5,true);
	};
  
//keep the pointer inside the bounds
   rRect = InflateRect(g.boundsRect,-g.ptrDiv2,0);
   s = rRect.right - rRect.left; 			//how many pixels in the indicator, width
   percent = EngToPercent(g.currentValue,0,100);
   if (g.invert)
     percent = 100 - percent;

   x = rRect.left + (s * (percent / 100));

   if (g.ptrPosition == 0)               //left/bottom
   {
	DrawBottom();
	if (g.mirror)
	 DrawTop();
   }
   else
   {
	DrawTop();
	if (g.mirror)
	 DrawBottom();
   };
   
   if (g.lineWidth > 0) {  
    g.ctx.strokeStyle = g.color;
	g.ctx.lineWidth = g.lineWidth;
    g.ctx.beginPath();
    g.ctx.moveTo(x,rRect.top);
    g.ctx.lineTo(x,rRect.bottom);
    g.ctx.stroke();
   };
  }; 		//end of DrawHorz
  
  function DrawVert(){ 

	function DrawLeft() {
	 var x;	  
	 x = rRect.left + g.ptrSize;
	 triangle[0].x = x;
	 triangle[0].y = y;            //point on the indicator edge
   
     triangle[1].x = rRect.left;
	 triangle[1].y = y - g.ptrDiv2;  //top point

	 triangle[2].x = rRect.left;
	 triangle[2].y = y + g.ptrDiv2;  //bottom point
     DrawPolygon(g.ctx,g.color,triangle,true,0.5,true);
	};

	function DrawRight() {
	 var x;	  
	 x = rRect.right - g.ptrSize;
	 triangle[0].x = x;
	 triangle[0].y = y;

	 triangle[1].x = rRect.right;
	 triangle[1].y = y - g.ptrDiv2;  //top point

	 triangle[2].x = rRect.right;
	 triangle[2].y = y + g.ptrDiv2;  //bottom point
     DrawPolygon(g.ctx,g.color,triangle,true,0.5,true);
	};
  
//keep the pointer inside the bounds
   rRect = InflateRect(g.boundsRect,0,-g.ptrDiv2);
   s = rRect.bottom - rRect.top; 			//how many pixels in the indicator, height
   percent = EngToPercent(g.currentValue,0,100);
   if (g.invert)
     percent = 100 - percent;

   y = rRect.bottom - (s * (percent / 100));

   if (g.ptrPosition == 0)               //left/bottom
   {
	DrawLeft();
	if (g.mirror)
	 DrawRight();
   }
   else
   {
	DrawRight();
	if (g.mirror)
	 DrawLeft();
   };
   
   if (g.lineWidth > 0) {  
    g.ctx.strokeStyle = g.color;
	g.ctx.lineWidth = g.lineWidth;
    g.ctx.beginPath();
    g.ctx.moveTo(rRect.left,y);
    g.ctx.lineTo(rRect.right,y);
    g.ctx.stroke();
   };

  }; 				//end of DrawVert
 
//start of DrawPointer code
  
 if (g.isHorz)
  DrawHorz();
 else
  DrawVert();

 };			//end of DrawPointer


//helper functions
function DrawPolygon (ctx,theColor,theArray,fill,penWidth,closeIt){
 var i, len = theArray.length;
 if (len < 2)
  return;

 ctx.lineWidth = penWidth;
 ctx.beginPath();
 ctx.moveTo(theArray[0].x,theArray[0].y);

 for(i = 1; i < len; i++) {
  ctx.lineTo(theArray[i].x,theArray[i].y);
 };	 

 if (closeIt)
  ctx.lineTo(theArray[0].x,theArray[0].y);
  
 if (fill) {
  ctx.fillStyle = theColor;
  ctx.fill();
 }
 else {
  ctx.strokeStyle = theColor;
  ctx.stroke();
 } 
 
// FrameRect(ctx,"black",g.boundsRect,1);	//uncomment to show the gauge bounds
};

function DrawRect(ctx,theColor,theRect){
 ctx.fillStyle = theColor;
 ctx.fillRect(theRect.left,theRect.top, theRect.right - theRect.left, theRect.bottom - theRect.top); 
};

function EngToPercent(p,rlow,rHigh) {
 var result = EnsureRange((100 / (rHigh - rlow)) * (p - rlow),0,100);
 return result;
};

function EnsureRange(value,min,max) {
 var result = value;
 if (result < min)
  result = min;
 if (result > max)
  result = max;
 return result;
};

function FrameRect(ctx,theColor,theRect, penWidth){
 ctx.lineWidth = penWidth;
 ctx.strokeStyle = theColor;
 ctx.strokeRect(theRect.left,theRect.top, theRect.right - theRect.left, theRect.bottom - theRect.top); 
};

function InflateRect (inRect,DX,DY) {
 var result = {left:0, top:0, right:0, bottom:0};
 result.left = inRect.left - DX;
 result.right = inRect.right + DX;
 result.top = inRect.top - DY;
 result.bottom = inRect.bottom + DY;
 return result;
};

}