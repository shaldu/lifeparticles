import * as THREE from 'three';
import type Lifesource from './lifesource';
import { Helpers } from './helpers';
import type LifesourceManager from './lifesourceManager';

export default class SpatialGrid {

    cellSize: number;
    grid: Array<Array<any>> = [];

    size: number = 0;
    division: number = 0;
    queryIds = 0;
    public boundingBox: THREE.Box3;

    constructor(division: number, boundingBox: THREE.Box3) {
        this.boundingBox = boundingBox;
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y);
        this.size = maxSize;
        this.division = division;
        this.cellSize = maxSize / division;
        // initialize grid with empty arrays
        for (let x = 0; x < division; x++) {
            this.grid[x] = [];
            for (let y = 0; y < division; y++) {
                this.grid[x][y] = null;
            }
        }
    }

    drawGrid(scene: THREE.Scene) {
        //create a debug grid
        const gridHelper = new THREE.GridHelper(this.size, this.division);
        //rotate the grid so it's flat on the ground
        gridHelper.rotation.x = Math.PI / 2;
        scene.add(gridHelper);
    }

    addLifesource(lifesource: Lifesource) {
        //add lifesource to grid
        const [x,y] = lifesource.position;
        const w = lifesource.dimensions.x;
        const h = lifesource.dimensions.y;

        const i1 = this.getCellIndex(new THREE.Vector2(x - w/2, y-h/2));
        const i2 = this.getCellIndex(new THREE.Vector2(x + w/2, y+h/2));

        const nodes: any = [];

        for (let x = i1[0], xn = i2[0]; x <=xn; ++x) {
            nodes.push([]);

            for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
                const xi = x - i1[0];

                const head: {next: any, prev: any, lifesource: Lifesource} = {
                    next: null,
                    prev: null,
                    lifesource: lifesource
                } ;

                nodes[xi].push(head);

                head.next = this.grid[x][y];

                if (this.grid[x][y]) {
                    this.grid[x][y].prev = head;
                }

                this.grid[x][y] = head;
            }

        }
        
        lifesource.cells.min = i1;
        lifesource.cells.max = i2;
        lifesource.cells.nodes = nodes;        
    }

    findNearbyLifesources(position: THREE.Vector2, dimensions: THREE.Vector2, lifesourceManager:LifesourceManager): Array<Lifesource> {
        const [x,y] = position;
        const w = dimensions.x;
        const h = dimensions.y;

        const i1 = this.getCellIndex(new THREE.Vector2(x - w/2, y-h/2));
        const i2 = this.getCellIndex(new THREE.Vector2(x + w/2, y+h/2));

        const lifesources: Array<Lifesource> = [];
        const queryId = this.queryIds++;

        for (let x = i1[0], xn = i2[0]; x <=xn; ++x) {
            for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
                let lifesource = this.grid[x][y];
                    
                if (!lifesource) continue;
                if (lifesource.lifesource.lifesourceManager !== lifesourceManager) continue;

                while (lifesource) {
                    const v = lifesource.lifesource;
                    lifesource = lifesource.next;

                    if (v._queryId !== queryId) {
                        v._queryId = queryId;
                        lifesources.push(v);
                    }
                }
            }
        }
        return lifesources;
    }

    removeLifesource(lifesource: Lifesource) {
    
        const i1 = lifesource.cells.min;
        const i2 = lifesource.cells.max;

        for (let x = i1[0], xn = i2[0]; x <=xn; ++x) {
            for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
                const xi = x - i1[0];
                const yi = y - i1[1];
                const node = lifesource.cells.nodes[xi][yi];

                if (node.next) {
                    node.next.prev = node.prev;
                }
                if (node.prev) {
                    node.prev.next = node.next;
                }

                if (!node.prev) {
                    this.grid[x][y] = node.next;
                }

            }
        }
    
        lifesource.cells.min = null;
        lifesource.cells.max = null;
        lifesource.cells.nodes = null;    
    }

    updateLifesource(lifesource: Lifesource) {

        const [x,y] = lifesource.position;
        const w = lifesource.dimensions.x;
        const h = lifesource.dimensions.y;

        const i1 = this.getCellIndex(new THREE.Vector2(x - w/2, y-h/2));
        const i2 = this.getCellIndex(new THREE.Vector2(x + w/2, y+h/2));

        if (i1[0] === lifesource.cells.min[0] && i1[1] === lifesource.cells.min[1] && i2[0] === lifesource.cells.max[0] && i2[1] === lifesource.cells.max[1]) {
            return;
        }

        this.removeLifesource(lifesource);
        this.addLifesource(lifesource);

    }

    getCellIndex(position: THREE.Vector2) {
        const x = Helpers.sat((position.x - this.boundingBox.min.x) / (this.boundingBox.max.x - this.boundingBox.min.x));
        const y = Helpers.sat((position.y - this.boundingBox.min.y) / (this.boundingBox.max.y - this.boundingBox.min.y));

        const xIndex = Math.floor(x * (this.division - 1));
        const yIndex = Math.floor(y * (this.division - 1));

        return [xIndex, yIndex];
    }

    //calculate the gridposition of a lifesource
    calculateGridPosition(position: THREE.Vector2): THREE.Vector2 {
        const x = Math.floor(position.x / this.cellSize);
        const y = Math.floor(position.y / this.cellSize);
        return new THREE.Vector2(x, y);
    }

    update(deltaTime:number) {
        //updates all lifesources in each cell
        // for (let x = 0; x < this.division; x++) {
        //     for (let y = 0; y < this.division; y++) {
        //         let lifesources = this.grid[x][y];
        //         while (lifesources) {
        //             lifesources.lifesource.update(deltaTime);
        //             lifesources = lifesources.next;
        //         }                            
        //     }
        // }
    }

}