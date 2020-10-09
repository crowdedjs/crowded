/*
Copyright (c) 2009-2010 Mikko Mononen memon@inside.org
Recast4J Copyright (c) 2015 Piotr Piastucki piotr@jtilia.org

This software is provided 'as-is', without any express or implied
warranty.  In no event will the authors be held liable for any damages
arising from the use of this software.
Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:
1. The origin of this software must not be misrepresented; you must not
 claim that you wrote the original software. If you use this software
 in a product, an acknowledgment in the product documentation would be
 appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be
 misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

/** Represents a simple, non-overlapping contour in field space. */
class Contour {

	/** Simplified contour vertex and connection data. [Size: 4 * #nverts] */
verts = [];
	/** The number of vertices in the simplified contour. */
nverts = 0;
	/** Raw contour vertex and connection data. [Size: 4 * #nrverts] */
rverts = [];
	/** The number of vertices in the raw contour.  */
nrverts = 0;
	/** The region id of the contour. */
area = 0;
	/** The area id of the contour. */
reg = 0;

}

export default Contour;
