

// exCon Kristina Mulry & Bryan Hanson, DePauw University, February 2014

// Brush related functions

var activateBrush = function() {
    // Creates the brush, appends it, and defines its behavior

    // IMPORTANT: xD & yD are global variables

    var brush = d3.svg.brush()
    // Defines the brush, and calls the relevant functions
	.x(d3.scale.identity().domain([(lPad + conWidth + gap),
        (lPad + conWidth + gap + mapWidth)]))
	.y(d3.scale.identity().domain([(tPad + conHeight + gap),
        (tPad + conHeight + gap + mapHeight)]))
	.on("brushend", brushed)

    svg.append("svg") // Appends the svg to include the brush
	.attr("class", "brush")
	.call(brush)

    // brushed = function() { // doesn't work
    // var brushed = function() { // doesn't work
    function brushed() { // Handles the response to brushing

    	var extent = brush.extent() // reports in pixels
    	var minX = extent[0][0]
    	var maxX = extent[1][0]
    	var minY = extent[0][1]
    	var maxY = extent[1][1]
    	var x0 = lPad + conWidth + gap // dim of map region
    	var y0 = tPad + conHeight + gap
    	var x1 = x0 + mapWidth
    	var y1 = y0 + mapHeight
    	var xL = ((minX-x0)/(x1-x0)) // as a frac of map region
    	var xU =  ((maxX-x0)/(x1-x0))
    	var yL = ((minY-y0)/(y1-y0))
    	var yU =  ((maxY-y0)/(y1-y0))
        var spanX = Dx[1] - Dx[0]
        var spanY = Dy[1] - Dy[0]
        // update global values
    	xD = [((spanX*xL) + Dx[0]), ((spanX*xU) + Dx[0])]
        // yD is more complex since the reference point is the top of the screen
        yD = [(spanY*(1-yU) + Dy[0]), (spanY*(1-yL) + Dy[0])]
        // save the extent in fraction units, needed by
        // the row counter in eC_slices.js
        // reference point 0,0 is lower left
        brushExtent = [xL, xU, 1-yU, 1-yL] // global variable
    	clearContour();
    	drawContour(xD, yD);
    } // end of brushed

} // end of activateBrush

var clearBrush = function() {
    d3.selectAll(".brush").remove();
    xD = Dx; // reset global variables
    yD = Dy;
    activateBrush();
}

// Guide & slice related functions.  Note that these need to
// respond to brushing, which changes xD and yD

// Now the create the guides that will control the slices

var activateGuides = function() {

    // Controls the guides (cursor) in the contour area
    // AND ultimately the slicing process which depends
    // on the cursor position

    // IMPORTANT: xD, yD, xF, yF, xM, yM are global variables

    var getMouseXY = function() {
    // get the mouse coordinates & report in terms of [0...1]
    	var mouse = d3.mouse(document.getElementById("CON"));
    	mX = mouse[0]; // in pixels
    	mY = mouse[1];
    	if (mX < 0) {mX = 0}; // truncate low
    	if (mY < 0) {mY = 0};
    	if (mX > conWidth) {mX = conWidth}; // truncate high
    	if (mY > conHeight) {mY = conHeight};
    	mX = mX/conWidth // as fraction
    	mY = 1 - (mY/conHeight)
    	followMouse(mX, mY);
    	document.Show.mouseX.value = mX;
    	document.Show.mouseY.value = mY;

        // Using 0.01 & 0.99 to avoid a silent rounding error
        // just as cursor moved out of contour area

        if (mY <= 0.01 || mY >= 0.99) {
            clearXslice()
        } else {
            var row = getRowIndex(M, mY)
            drawXslice(row)
        }

        if (mX <= 0.01 || mX >= 0.99) {
            clearYslice()
        } else {
            var col = getColIndex(M, mX)
            drawYslice(col)
        }

    } // end of getMouseXY

    var followMouse = function(mX, mY) { // This draws the guides, nothing else

        var xPos = (mX * conWidth) + lPad // mX now in pixels
    	var yPos = tPad + conHeight - (mY * conHeight) // mY now in pixels

    	var vertU = {x: xPos, y: tPad } // x, y at the top of window
        // x, y at the bottom of window:
    	var vertL = {x: xPos, y: tPad + conHeight }
    	var vEnds = [vertU, vertL];

    	var horzU = {x: lPad, y: yPos } // x, y at the left side of window
        // x, y at the right side of window:
    	var horzL = {x: lPad + conWidth, y: yPos }
    	var hEnds = [horzU, horzL];

    	d3.selectAll(".cursorGuide") // remove previous lines
    	    .remove();

    	var line = d3.svg.line()
    	    .x(function(d) { return d.x;})
    	    .y(function(d) { return d.y;})

    	svg.append("path")
        	    .attr("class", "line")
                .attr("class", "cursorGuide")
        	    .attr("d", line(hEnds))

    	svg.append("path")
        	    .attr("class", "line")
                .attr("class", "cursorGuide")
        	    .attr("d", line(vEnds))

    } // end of followMouse

    getMouseXY(xD, yD); // This starts it all off

} // end of activateGuides
