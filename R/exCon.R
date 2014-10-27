##' Explore Contour Data Interactively
##'
##' This function computes contour lines from matrix data and displays them
##' in an interactive web page using the d3 javascript library.
##' 
##' @param M A matrix.
##'
##' @param x A vector of numeric values giving the locations of the grid defining
##' the matrix.  Must have length \code{nrow(M)}.
##'
##' @param y A vector of numeric values giving the locations of the grid defining
##' the matrix.  Must have length \code{ncol(M)}.
##'
##' @param nlevels  Integer.  The number of contour levels desired.  Ignored if \code{levels}
##' is given.
##'
##' @param levels  Numeric.  A vector of values (altitudes if you will) at which to
##' compute the contours.
##'
##' @section Details: The computation of the contour lines is handled by
##' \code{\link[grDevices]{contourLines}}.  The result here, however, is transposed so that the
##' output has the same orientation as the original matrix. This is necessary because
##' \code{\link[graphics]{contour}} tranposes its output: "Notice that
##' \code{contour} interprets the \code{z} matrix as a table of 
##' \code{f(x[i], y[j])} values, so that the x axis corresponds to row number
##' and the y axis to column number, with column 1 at the bottom, i.e. a 90 degree
##' counter-clockwise rotation of the conventional textual layout."
##' 
##' @section Interpretation:  The contour lines are an interpolation of the data
##' in the matrix.  The slices are the actual values in the matrix row or column
##' connected point-to-point.  Thus a maximum in a slice may not correspond to 
##' a peak in the contour plot.
##' 
##' @section Performance: In testing, a 4000 x 4000 matrix with 5 contour levels
##' requires about 30 seconds to create the contours.  The resulting web page in
##' Chrome appears to be about 85 Mb in size and the guide movements lag the mouse
##' movements quite a bit, but it is still usable.  A 5000 x 5000 matrix causes
##' Chrome to crash.
##'
##' @return None; side effect is an interactive web page.
##' 
##' @name exCon
##' @rdname exCon
##' @export
##' @import jsonlite
##' @keywords plot
##'
##' @examples
##' require(jsonlite)
##' exCon(M = volcano)
##'
exCon <- function(M = NULL,
	x = seq(0, 1, length.out = nrow(M)),
	y = seq(0, 1, length.out = ncol(M)),
	nlevels = 5,
	levels = pretty(range(M, na.rm = TRUE), nlevels)) {

	# Bryan A. Hanson, DePauw University, April 2014
	# This is the R front end controlling everything
	# The html and js files called indirectly written by
	# Kristina Mulry and Bryan A. Hanson

	if (is.null(M)) stop("You must provide a matrix M")
	if (!is.matrix(M)) stop("M must be a matrix")

	# M is the raw, topographic data matrix:
	# think of it as altitudes on an x,y grid

	# Major steps
	# 1. Convert M to contour lines (CL)
	# 2. Read in the existing js, then pre-pend
	#    M and CL to to it and write it back out
	# 3. Call a browser on the html to open it automatically

	# Compute contour lines
	# (Eventually need to supply nlevels & levels,
	# Also a name for the data set)
	dimnames(M) <- list(rep("x", nrow(M)), rep("y", ncol(M)))
	CL <- contourLines(z = M, nlevels = nlevels, levels = levels,
		x = x, y = y)

	# Get the contour lines into JSON format

	# This is the manual approach, from Yihui Xie's blog

	# This is the automated approach which brings along extra info
	# but it is ignored since it is never requested.

	CL <- toJSON(CL)

	# Get M into JSON format
	# [ [row1...], [row2...], [lastRow...] ]

	M <- toJSON(t(M))

	# We need the first and last values of x and y
	# to be the xD and yD (the domains)
	# These are in the units of whatever is supplied (native)

	DX <- toJSON(c(x[1], x[length(x)]))
	DY <- toJSON(c(y[1], y[length(y)]))

	# Prepare the data
	
	data1 <- paste("var CL = ", CL, sep = "")
	data2 <- paste("var M = ", M, sep = "")
	data3 <- paste("var Dx = ", DX, sep = "")
	data4 <- paste("var Dy = ", DY, sep = "")

	# Get the JavaScript modules & related files
	
	cd <- getwd()
	td <- tempdir()
	fd <- system.file("extdata", package = "exCon")
	eCfiles <- c("eC_globals.js", "eC_controls.js", "eC_contours.js",
	"eC_brushNguides.js", "eC_slices.js", "eC_main.js", "eC.css", "exCon.html")	
	file.copy(paste(fd, eCfiles, sep = "/"), paste(td, eCfiles, sep = "/"))
	setwd(td)

	js1 <- readLines(con = "eC_globals.js")
	js2 <- readLines(con = "eC_controls.js")
	js3 <- readLines(con = "eC_contours.js")
	js4 <- readLines(con = "eC_brushNguides.js")
	js5 <- readLines(con = "eC_slices.js")
	js6 <- readLines(con = "eC_main.js")

	# Now write
	
	writeLines(text = c(data1, data2, data3, data4,
		js1, js2, js3, js4, js5, js6),
		sep  = "\n", con = "exCon.js")

	# Open the file in a browser
	# Requires Chrome (should check, and find on any platform)

	pg <- "exCon.html"
	# this next line probably only works on Mac/Unix platforms
	browseURL(pg, browser = "/usr/bin/open -a 'Google Chrome'")
	#browseURL(pg)
	setwd(cd)
	invisible()
}