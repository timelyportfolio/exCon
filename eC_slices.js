

// exCon Kristina Mulry & Bryan Hanson, DePauw University, February 2014

// Slice related functions. Note that these need to respond to brushing,
// which changes xD and yD

// A helper function first

var arraySize = function(array) { // merged from several SO post ideas
	// js is row-major
	// assumes 2D array
	// assumes each row has the same length (= no. of columns)
	var nrows = array.length
	var ncols = array[0].length // length of first row
	return [nrows, ncols]
}


var getXsliceLimits = function() {

	// This function gets the left & right edge indices
	// based on xD (the limits)
	// These are column numbers

	var nc = arraySize(M)[1]; // no. of columns in data set
	var xbase = d3.range(1, nc + 1); // array of column numbers 1:nc

	// The next steps find the indices corresponding to xD
	var left = Math.round(xD[0] * nc + 1); // left edge/index of plotting window
	var right = Math.round(xD[1] * nc); // right edge
	var lIndex = xbase.indexOf(left);
	var rIndex = xbase.indexOf(right);

	return [lIndex, rIndex];

} // end of getXsliceLimits


var getXsliceXvalues = function() {

	// This function creates the x values needed for the x slice
	// These are a selection of the column numbers

	var lIndex = getXsliceLimits()[0];
	var rIndex = getXsliceLimits()[1];
	var nc = arraySize(M)[1];
	var xbase = d3.range(1, nc + 1);
	var xdata = xbase.slice(lIndex, rIndex + 1);
	return xdata;

} // end of getXsliceXvalues


var getXsliceYvalues = function(row) {

	// This function creates the y values needed for the x slice
	// See getXsliceLimits for logic & comments

	var ybase = M[row]; // the y values in the row
	var lIndex = getXsliceLimits()[0];
	var rIndex = getXsliceLimits()[1];
	var ydata = ybase.slice(lIndex, rIndex + 1);
	return ydata;
} // end of getXsliceYvalues


var getRowIndex = function(M, mY) {

	var nRow = arraySize(M)[0];
	// IMPORTANT: reference point for brushing extent is lower left corner!
	//
	var yU = yD[1] * nRow; // Get upper row index
	var yL = yD[0] * nRow; // Get lower row index
	var yInd = yL + ((mY) * (yU - yL)); // get cursor position
	yInd =  Math.round(yInd);
	yInd = yInd - 1; // accts for zero-indexing in js
	// and the fact that R put the first row at the bottom!
	if (yInd < 0) {yInd = 0};
	if (yInd > nRow - 1) {yInd = nRow - 1};
    	document.Show.mouseRow.value = yInd;
	return(yInd);
} // end of getRowIndex


var drawXslice = function(row) {

	// WARNING: the matrix data has the columns in the correct order
	// However, row 1 of the M matrix is at the bottom of the display
	// and js counts from the top of the svg

	// start by removing any existing xslice
	d3.selectAll(".xslice")
	    .remove();

	var offset = tPad + conHeight + gap;

	var xdata = getXsliceXvalues();
	var ydata = getXsliceYvalues(row);
	var xy = []; // start empty, add each element one at a time
	for(var i = 0; i < xdata.length; i++ ) {
	    xy.push({x: xdata[i], y: ydata[i]});
	}

	var xscl = d3.scale.linear()
	    .domain(d3.extent(xy, function(d) {return d.x;})) //use just the x part
	    .range([lPad, xslWidth + lPad])

    var minM = d3.min(M, function(d) { return d3.min(d); });
    var maxM = d3.max(M, function(d) { return d3.max(d); });

	var yscl = d3.scale.linear()
        // Next line scales so that slice area is filled
        // This is relative scaling (not desired, kept for reference)
	    // .domain(d3.extent(xy, function(d) {return d.y;})) // use just the y part
        // Absolute scaling
        .domain([minM, maxM * yF])
	    .range([xslHeight + offset, offset + 5])
	var slice = d3.svg.line()
	    .x(function(d) { return xscl(d.x);}) // apply the x scale to the x data
	    .y(function(d) { return yscl(d.y);}) // apply the y scale to the y data
	svg.append("path")
	    .attr("class", "line")
	    .attr("class", "xslice")
	    .attr("d", slice(xy)) // use the return value of slice(xy) as 'd'
} // end of drawXslice


// Now everything related to the y slice

var getYsliceLimits = function() {

	// This function gets the bottom and top edge limits
	// based on yD
	// These are row numbers

	var nr = arraySize(M)[0]; // no. of rows in data set
	var ybase = d3.range(1, nr + 1); // array of row numbers 1:nr
	// The next steps find the indices corresponding to yD
	var bottom = Math.round(yD[0] * nr + 1); // bottom value
	var top = Math.round(yD[1] * nr); // top value of desired plotting window
	var bIndex = ybase.indexOf(bottom);
	var tIndex = ybase.indexOf(top);
	return [bIndex, tIndex];

    } // end of getYsliceLimits


var getYsliceYvalues = function() {

	// This function creates the y values (actual data) needed for the y slice

	var bIndex = getYsliceLimits()[0];
	var tIndex = getYsliceLimits()[1];
	var nr = arraySize(M)[0];
	var ybase = d3.range(1, nr+1);
	var ydata = ybase.slice(bIndex, tIndex +1);
	return ydata;
}


var getYsliceXvalues = function(col){
	var xdata = []; // Get just the column of interest
	var nr = arraySize(M)[0];
	for (var i = 0; i < nr; i++){
	    xdata.push(M[i][col]);
	}
	var bIndex = getYsliceLimits()[0];
	var tIndex = getYsliceLimits()[1];
	xdata = xdata.slice(bIndex, tIndex + 1);
	return xdata;
}


var getColIndex = function(M, mX) { // Row index in the original matrix
	var nCol = arraySize(M)[1];
	var xU = xD[1] * nCol;
	var xL = xD[0] * nCol;
	var xInd = xL + ((mX) * (xU - xL));
	xInd  =  Math.round(xInd);
	xInd = xInd - 1;
	if (xInd < 0) {xInd = 0};
	if (xInd > nCol - 1) {xInd = nCol - 1};
	document.Show.mouseCol.value = xInd;
	return(xInd);
} // end of getColIndex

var drawYslice = function(col) {

	// WARNING: the matrix data has the columns in the correct order
	// However, row 1 of the M matrix is at the bottom of the display
	// and js counts from the top of the svg

	// See drawXslice for some additional comments

	// start by removing any existing y slice
	d3.selectAll(".yslice")
	    .remove();

	var offset = tPad;

     // Important: on the y slice, the x values are the column slice,
     // and the y values are the row numbers (since the plot is rotated 90)

	var xdata = getYsliceXvalues(col);
	var ydata = getYsliceYvalues();
	// Because of how the x data is created, we need to reverse it
	var xy = []; // start empty, add each element one at a time
	for(var i = 0; i < ydata.length; i++ ) {
	    xy.push({x: xdata[i], y: ydata[i]});
	}

    var minM = d3.min(M, function(d) { return d3.min(d); });
    var maxM = d3.max(M, function(d) { return d3.max(d); });

	var xscl = d3.scale.linear()
	    .domain([minM, maxM])
		// range is set so the top of the peaks point toward the contour area
	    .range([(lPad + conWidth + gap + yslWidth),
			(lPad + conWidth + gap + 5)])
	var yscl = d3.scale.linear()
		.domain(d3.extent(xy, function(d) {return d.y;}))
	    .range([yslHeight + offset, offset])

	var slice = d3.svg.line()
	    .x(function(d) { return xscl(d.x);})
	    .y(function(d) { return yscl(d.y);})
	svg.append("path")
	    .attr("class", "line")
	    .attr("class", "yslice")
	    .attr("d", slice(xy))
} // end of drawYslice