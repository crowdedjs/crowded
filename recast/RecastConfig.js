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


class RecastConfig {
	partitionType = null;

	/** The width/height size of tile's on the xz-plane. [Limit: >= 0] [Units: vx] **/
	tileSize;

	/** The xz-plane cell size to use for fields. [Limit: > 0] [Units: wu] **/
	cs;

	/** The y-axis cell size to use for fields. [Limit: > 0] [Units: wu] **/
	ch;

	/** The maximum slope that is considered walkable. [Limits: 0 <= value < 90] [Units: Degrees] **/
	walkableSlopeAngle;

	/**
	 * Minimum floor to 'ceiling' height that will still allow the floor area to be considered walkable. [Limit: >= 3]
	 * [Units: vx]
	 **/
	walkableHeight;

	/** Maximum ledge height that is considered to still be traversable. [Limit: >=0] [Units: vx] **/
	walkableClimb;

	/**
	 * The distance to erode/shrink the walkable area of the heightfield away from obstructions. [Limit: >=0] [Units:
	 * vx]
	 **/
	walkableRadius;

	/** The maximum allowed length for contour edges aPoly the border of the mesh. [Limit: >=0] [Units: vx] **/
	maxEdgeLen;

	/**
	 * The maximum distance a simplfied contour's border edges should deviate the original raw contour. [Limit: >=0]
	 * [Units: vx]
	 **/
	maxSimplificationError;

	/** The minimum number of cells allowed to form isolated island areas. [Limit: >=0] [Units: vx] **/
	minRegionArea;

	/**
	 * Any regions with a span count smaller than this value will, if possible, be merged with larger regions. [Limit:
	 * >=0] [Units: vx]
	 **/
	mergeRegionArea;

	/**
	 * The maximum number of vertices allowed for polygons generated during the contour to polygon conversion process.
	 * [Limit: >= 3]
	 **/
	maxVertsPerPoly = 0;

	/**
	 * Sets the sampling distance to use when generating the detail mesh. (For height detail only.) [Limits: 0 or >=
	 * 0.9] [Units: wu]
	 **/
	detailSampleDist;

	/**
	 * The maximum distance the detail mesh surface should deviate from heightfield data. (For height detail only.)
	 * [Limit: >=0] [Units: wu]
	 **/
	detailSampleMaxError;

	walkableAreaMod;

	constructor(partitionType, cellSize, cellHeight, agentHeight,
		agentRadius, agentMaxClimb, agentMaxSlope, regionMinSize, regionMergeSize,
		edgeMaxLen, edgeMaxError, vertsPerPoly, detailSampleDist, detailSampleMaxError,
		tileSize, walkableAreaMod) {
		this.partitionType = partitionType;
		this.cs = cellSize;
		this.ch = cellHeight;
		this.walkableSlopeAngle = agentMaxSlope;
		this.walkableHeight = Math.ceil(agentHeight / this.ch);
		this.walkableClimb = Math.floor(agentMaxClimb / this.ch);
		this.walkableRadius = Math.ceil(agentRadius / this.cs);
		this.maxEdgeLen = Math.floor(edgeMaxLen / cellSize);
		this.maxSimplificationError = edgeMaxError;
		this.minRegionArea = regionMinSize * regionMinSize; // Note: area = size*size
		this.mergeRegionArea = regionMergeSize * regionMergeSize; // Note: area = size*size
		this.maxVertsPerPoly = vertsPerPoly;
		this.detailSampleDist = detailSampleDist < 0.9 ? 0 : cellSize * detailSampleDist;
		this.detailSampleMaxError = cellHeight * detailSampleMaxError;
		this.tileSize = tileSize;
		this.walkableAreaMod = walkableAreaMod;
	}

}

export default RecastConfig;