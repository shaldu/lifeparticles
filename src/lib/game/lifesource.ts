//@ts-ignore
import * as THREE from 'three';
import type LifesourceManager from './lifesourceManager';

export default class Lifesource {
    name = 'yellow';
    position: THREE.Vector2;
    velocity: THREE.Vector2 = new THREE.Vector2(0, 0);
    matrixId = 0;

    dimensions: THREE.Vector2;

    lifesourceManager: LifesourceManager;
    cells: {min: any, max:any, nodes:any} = {min: null, max: null, nodes: null};
    _queryId: number = -1;
    prev: { next: any; prev: any; lifesource: Lifesource; } | null = null;

    constructor(lifesourceManager: LifesourceManager, name: string, position: THREE.Vector2, matrixId: number, dimensions: THREE.Vector2) {
        this.name = name;
        this.position = position;
        this.matrixId = matrixId;
        this.lifesourceManager = lifesourceManager;
        this.dimensions = dimensions;

    }
}