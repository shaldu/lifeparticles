export type TileTypeTexture = { x: number, y: number }
export type Location = { x: number, y: number, z: number }
export type TileTypeTextureOffset = { x: number, y: number }
import { createType, copyCopyable, cloneClonable } from "ecsy";
import * as THREE from 'three';

export enum TileType {
    Water,
    Gras,
    Sand,
    Tree,
    Mountain,
    DeepWater,
}

export const TileTypeTextureOffsetReference: { [name: string]: TileTypeTexture } = {
    Water: { x: 13, y: 18 },
    WaterTop: { x: 14, y: 17 },
    WaterRight: { x: 14, y: 19 },
    WaterBottom: { x: 12, y: 19 },
    WaterLeft: { x: 12, y: 17 },
    WaterTopRight: { x: 15, y: 17 },
    WaterBottomRight: { x: 15, y: 18 },
    WaterBottomLeft: { x: 11, y: 19 },
    WaterTopLeft: { x: 12, y: 16 },
    Gras: { x: 29, y: 6 },
    Gras1: { x: 29, y: 6 },
    Gras2: { x: 30, y: 6 },
    Gras3: { x: 26, y: 9 },
    Sand: { x: 0, y: 13 },
    Sand2: { x: 1, y: 13 },
    Tree: { x: 29, y: 12 },
    Tree1: { x: 29, y: 0 },
    Tree2: { x: 30, y: 12 },
    Mountain: { x: 13, y: 29 },
    DeepWater: { x: 12, y: 29 },
    Ash: { x: 2, y: 4 },
    //burned states
    BurnedGras: { x: 29, y: 5 },
    BurnedTree: { x: 29, y: 13 },
}

export const Vector2Type = createType({
    name: "Vector2",
    default: new THREE.Vector2(0,0),
    copy: copyCopyable,
    clone: cloneClonable
  });