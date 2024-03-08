import Lifesource from "./lifesource";
import type Rule from "./rule";
//@ts-ignore
import * as THREE from "three";
import { InstancedUniformsMesh } from 'three-instanced-uniforms-mesh';
import fragmentShader from './shaders/fragmentShader.glsl.js';
import vertexShader from './shaders/vertexShader.glsl.js';
import { Helpers } from "./helpers";
import type SpatialGrid from "./spatialGrid";


/**
 * LifesourceManager
 * Manages the lifesources of a type for example "yellow"
 * The class will have a list of all the lifesources of that type and rules between them
 * 
 * This class also contains the visual representation of the lifesources since we will use instanced meshes
 */
export default class LifesourceManager {

    rules: Rule[] = [];
    lifesources: Lifesource[] = [];
    public name: string;
    amount: number;
    scene: THREE.Scene;
    boundingBox: THREE.Box3;
    public color: string = "#ffff00";
    meshLayer: any;
    spatialGrid: SpatialGrid;

    //values
    lifeSourceDimensions: THREE.Vector2 = new THREE.Vector2(1, 1);

    constructor(name: string, amount: number, size:number, color: string, scene: THREE.Scene, boundingBox: THREE.Box3, spatialGrid: SpatialGrid) {
        this.name = name;
        this.amount = amount;
        this.scene = scene;
        this.boundingBox = boundingBox;
        this.color = color;
        this.lifeSourceDimensions = new THREE.Vector2(size, size);
        this.spatialGrid = spatialGrid;

        this.initInstancedMeshes();
        this.initLifesources();
    }

    initInstancedMeshes() {

        const geometry = new THREE.PlaneGeometry(this.lifeSourceDimensions.x, this.lifeSourceDimensions.y);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                vPosition: { value: new THREE.Vector4(0, 0, 0, 0) },
                vColor: { value: Helpers.hexToVector4(this.color) }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

        });

        this.meshLayer = new InstancedUniformsMesh(geometry, material, this.amount);
        this.scene.add(this.meshLayer);
    }

    initLifesources() {
        for (let i = 0; i < this.amount; i++) {
            const position = new THREE.Vector2(
                THREE.MathUtils.randFloat(this.boundingBox.min.x, this.boundingBox.max.x),
                THREE.MathUtils.randFloat(this.boundingBox.min.y, this.boundingBox.max.y)
            );
            const lifesource = new Lifesource(this, this.name, position, i, this.lifeSourceDimensions);
            this.lifesources.push(lifesource);
            this.spatialGrid.addLifesource(lifesource);
            this.setLifesourcePosition(lifesource);
        }
    }

    setLifesourcePosition(lifesource: Lifesource) {
        this.meshLayer.setUniformAt('vPosition', lifesource.matrixId, new THREE.Vector3(lifesource.position.x, lifesource.position.y, 0));
        this.spatialGrid.updateLifesource(lifesource);        
    }

    //either update it here or in the spatialGrid
    update() {
        // for (let i = 0; i < this.lifesources.length; i++) {
        //     const lifesource = this.lifesources[i];
        //     lifesource.update();
        //     this.setLifesourcePosition(lifesource);
        // }
    }

    changeColorOfAllLifesources(color: string) {
        //create a new material with the new color
        //set the new material to the meshLayer
        this.color = color;
        const material = new THREE.ShaderMaterial({
            uniforms: {
                vPosition: { value: new THREE.Vector4(0, 0, 0, 0) },
                vColor: { value: Helpers.hexToVector4(color) }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });

        this.meshLayer.material = material;
    }

    removeAllLifesources() {
        //loop through all the lifesources and remove them from the spatialGrid
        this.lifesources.forEach(lifesource => {
            this.spatialGrid.removeLifesource(lifesource);
        });
    }

}