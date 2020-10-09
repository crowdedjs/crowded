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

import Context from "./Context.js"
import Heightfield from "./Heightfield.js"
import Recast from "../recast/Recast.js"
import RecastRasterization from "./RecastRasterization.js"
import RecastFilter from "./RecastFilter.js"
import RecastArea from "./RecastArea.js"
import RecastConstants from "./RecastConstants.js"
import RecastRegion from "./RecastRegion.js"
import RecastContour from "./RecastContour.js"
import RecastMesh from "./RecastMesh.js"
import RecastMeshDetail from "./RecastMeshDetail.js"

class RecastBuilderResult {
    pmesh;
    dmesh;

    constructor(pmesh, dmesh) {
        this.pmesh = pmesh;
        this.dmesh = dmesh;
    }

    getMesh() {
        return this.pmesh;
    }

    getMeshDetail() {
        return this.dmesh;
    }
}


class RecastBuilder {

    // class RecastBuilderProgressListener {
    //     onProgress(completed, total);
    // }

    progressListener;

    // RecastBuilder() {
    //     progressListener = null;
    // }

    constructor(progressListener = null) {
        this.progressListener = progressListener;
    }



    buildTiles(geom, cfg, threads) {
        let bmin = geom.getMeshBoundsMin();
        let bmax = geom.getMeshBoundsMax();
        let twh = Recast.calcTileCount(bmin, bmax, cfg.cs, cfg.tileSize);
        let tw = twh[0];
        let th = twh[1];
        result = null;
        if (threads == 1) {
            result = buildSingleThread(geom, cfg, bmin, bmax, tw, th);
        } else {
            result = buildMultiThread(geom, cfg, bmin, bmax, tw, th, threads);
        }
        return result;
    }

    buildSingleThread(geom, cfg, bmin, bmax, tw,
        th) {
        result = new RecastBuilderResult[tw][th];
        counter = new AtomicInteger();
        for(let x = 0; x < tw; ++x) {
            for(let y = 0; y < th; ++y) {
                result[x][y] = buildTile(geom, cfg, bmin, bmax, x, y, counter, tw * th);
            }
        }
        return result;
    }

    buildMultiThread(geom, cfg, bmin, bmax, tw, th,
        threads) {
        ec = Executors.newFixedThreadPool(threads);
        result = new RecastBuilderResult[tw][th];
        counter = new AtomicInteger();
        for(let x = 0; x < tw; ++x) {
            for(let y = 0; y < th; ++y) {
                let tx = x;
                let ty = y;
                ec.submit(() => {
                    result[tx][ty] = buildTile(geom, cfg, bmin, bmax, tx, ty, counter, tw * th);
                });
            }
        }
        ec.shutdown();
        try {
            ec.awaitTermination(1000, TimeUnit.HOURS);
        } catch (e) {
        }
        return result;
    }

    buildTile(geom, cfg, bmin, bmax, tx, ty,
        counter, total) {
        result = build(geom, new RecastBuilderConfig(cfg, bmin, bmax, tx, ty, true));
        if (progressListener != null) {
            progressListener.onProgress(counter.incrementAndGet(), total);
        }
        return result;
    }

    build(geom, builderCfg) {

        let cfg = builderCfg.cfg;
        let ctx = new Context();
        let chf = this.buildCompactHeightfield(geom, builderCfg, ctx);

        // Partition the heightfield so that we can use simple algorithm later
        // to triangulate the walkable areas.
        // There are 3 martitioning methods, each with some pros and cons:
        // 1) Watershed partitioning
        // - the classic Recast partitioning
        // - creates the nicest tessellation
        // - usually slowest
        // - partitions the heightfield into nice regions without holes or
        // overlaps
        // - the are some corner cases where this method creates produces holes
        // and overlaps
        // - holes may appear when a small obstacles is close to large open area
        // (triangulation can handle this)
        // - overlaps may occur if you have narrow spiral corridors (i.e
        // stairs), this make triangulation to fail
        // * generally the best choice if you precompute the nacmesh, use this
        // if you have large open areas
        // 2) Monotone partioning
        // - fastest
        // - partitions the heightfield into regions without holes and overlaps
        // (guaranteed)
        // - creates let thin polygons, which sometimes causes paths with
        // detours
        // * use this if you want fast navmesh generation
        // 3) Layer partitoining
        // - quite fast
        // - partitions the heighfield into non-overlapping regions
        // - relies on the triangulation code to cope with holes (thus slower
        // than monotone partitioning)
        // - produces better triangles than monotone partitioning
        // - does not have the corner cases of watershed partitioning
        // - can be slow and create a bit ugly tessellation (still better than
        // monotone)
        // if you have large open areas with small obstacles (not a problem if
        // you use tiles)
        // * good choice to use for tiled navmesh with medium and small sized
        // tiles

        if (cfg.partitionType == RecastConstants.WATERSHED) {
            // Prepare for region partitioning, by calculating distance field
            // aPoly the walkable surface.
            RecastRegion.buildDistanceField(ctx, chf);
            // Partition the walkable surface into simple regions without holes.
            RecastRegion.buildRegions(ctx, chf, builderCfg.borderSize, cfg.minRegionArea, cfg.mergeRegionArea);
        } else if (cfg.partitionType == PartitionType.MONOTONE) {
            // Partition the walkable surface into simple regions without holes.
            // Monotone partitioning does not need distancefield.
            RecastRegion.buildRegionsMonotone(ctx, chf, builderCfg.borderSize, cfg.minRegionArea, cfg.mergeRegionArea);
        } else {
            // Partition the walkable surface into simple regions without holes.
            RecastRegion.buildLayerRegions(ctx, chf, builderCfg.borderSize, cfg.minRegionArea);
        }

        //
        // Step 5. Trace and simplify region contours.
        //

        // Create contours.
        let cset = RecastContour.buildContours(ctx, chf, cfg.maxSimplificationError, cfg.maxEdgeLen,
            RecastConstants.RC_CONTOUR_TESS_WALL_EDGES);

        //
        // Step 6. Build polygons mesh from contours.
        //

        let pmesh = RecastMesh.buildPolyMesh(ctx, cset, cfg.maxVertsPerPoly);
        
        //
        // Step 7. Create detail mesh which allows to access approximate height
        // on each polygon.
        //
        let dmesh = builderCfg.buildMeshDetail
            ? RecastMeshDetail.buildPolyMeshDetail(ctx, pmesh, chf, cfg.detailSampleDist, cfg.detailSampleMaxError)
            : null;
        return new RecastBuilderResult(pmesh, dmesh);
    }

    buildCompactHeightfield(geomProvider, builderCfg, ctx) {
        let cfg = builderCfg.cfg;
        //
        // Step 2. Rasterize input polygon soup.
        //

        // Allocate voxel heightfield where we rasterize our input data to.
        let solid = new Heightfield(builderCfg.width, builderCfg.height, builderCfg.bmin, builderCfg.bmax, cfg.cs, cfg.ch);
        // Allocate array that can hold triangle area types.
        // If you have multiple meshes you need to process, allocate
        // and array which can hold the max number of triangles you need to
        // process.

        // Find triangles which are walkable based on their slope and rasterize
        // them.
        // If your input data is multiple meshes, you can transform them here,
        // calculate
        // the are type for each of the meshes and rasterize them.
        let meshes = geomProvider.meshes();
        for (let geom of meshes) {
            let verts = geom.getVerts();
            let tiled = cfg.tileSize > 0;
            let totaltris = 0;
            if (tiled) {
                let tbmin = new Array(2);
                let tbmax = new Array(2);
                tbmin[0] = builderCfg.bmin[0];
                tbmin[1] = builderCfg.bmin[2];
                tbmax[0] = builderCfg.bmax[0];
                tbmax[1] = builderCfg.bmax[2];
                let nodes = geom.getChunksOverlappingRect(tbmin, tbmax);
                for (let node of nodes) {
                    let tris = node.tris;
                    let ntris = tris.length / 3;
                    totaltris += ntris;
                    let m_triareas = Recast.markWalkableTriangles(ctx, cfg.walkableSlopeAngle, verts, tris, ntris, cfg.walkableAreaMod);
                    RecastRasterization.rasterizeTriangles(ctx, verts, tris, m_triareas, ntris, solid, cfg.walkableClimb);
                }
            } else {
                let tris = geom.getTris();
                let ntris = tris.length / 3;
                let m_triareas = Recast.markWalkableTriangles(ctx, cfg.walkableSlopeAngle, verts, tris, ntris, cfg.walkableAreaMod);
                totaltris = ntris;
                RecastRasterization.rasterizeTrianglesA(ctx, verts, tris, m_triareas, ntris, solid, cfg.walkableClimb);
            }
        }
        // console.log(solid.spans[0])
        
        //
        // Step 3. Filter walkables surfaces.
        //

        // Once all geometry is rasterized, we do initial pass of filtering to
        // remove unwanted overhangs caused by the conservative rasterization
        // as well as filter spans where the character cannot possibly stand.
        RecastFilter.filterLowHangingWalkableObstacles(ctx, cfg.walkableClimb, solid);
        RecastFilter.filterLedgeSpans(ctx, cfg.walkableHeight, cfg.walkableClimb, solid);
        RecastFilter.filterWalkableLowHeightSpans(ctx, cfg.walkableHeight, solid);

        //
        // Step 4. Partition walkable surface to simple regions.
        //

        // Compact the heightfield so that it is faster to handle from now on.
        // This will result more cache coherent data as well as the neighbours
        // between walkable cells will be calculated.
        let chf = Recast.buildCompactHeightfield(ctx, cfg.walkableHeight, cfg.walkableClimb, solid);
        // console.log(chf.spans[450240])

        // Erode the walkable area by agent radius.
        RecastArea.erodeWalkableArea(ctx, cfg.walkableRadius, chf);
        // (Optional) Mark areas.
        for (let vol of geomProvider.getConvexVolumes()) {
            RecastArea.markConvexPolyArea(ctx, vol.verts, vol.hmin, vol.hmax, vol.areaMod, chf);
        }
        return chf;
    }

    buildLayers(geom, cfg) {
        let ctx = new Context();
        let chf = buildCompactHeightfield(geom, cfg, ctx);
        return RecastLayers.buildHeightfieldLayers(ctx, chf, cfg.borderSize, cfg.cfg.walkableHeight);
    }

}

export default RecastBuilder;
