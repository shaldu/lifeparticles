import * as THREE from 'three';
import type LifesourceManager from "./lifesourceManager";
import type SpatialGrid from "./spatialGrid";
import { Helpers } from './helpers';

//create a rule between 2 lifesources
export default class Rule {
    ruleName: string;

    source1: LifesourceManager | null;
    source2: LifesourceManager | null;

    //interaction values
    radius: number = 10;
    force: number = 1;

    spatialGrid: SpatialGrid;

    constructor(source1: LifesourceManager | null, source2: LifesourceManager | null, spatialGrid: SpatialGrid, radius: number, force: number) {
        this.ruleName = source1?.name + " - " + source2?.name;
        this.source1 = source1;
        this.source2 = source2;
        this.spatialGrid = spatialGrid;
        this.radius = radius;
        this.force = force;
    }


    update(deltaTime: number) {
        if (this.source1 === null || this.source2 === null) return;

        //For this.source1.lifesources
        for (let i = 0; i < this.source1.lifesources.length; i++) {
            const lifesource1 = this.source1.lifesources[i];
            const nearbyLifesources = this.spatialGrid.findNearbyLifesources(lifesource1.position, new THREE.Vector2(this.radius, this.radius), this.source2);

            for (let j = 0; j < nearbyLifesources.length; j++) {
                const lifesource2 = nearbyLifesources[j];

                const dx = lifesource1.position.x - lifesource2.position.x;
                const dy = lifesource1.position.y - lifesource2.position.y;

                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0 && distance < this.radius) {
                    //Maybe fix it so that the force is not so strong when the distance is small, like a limit, so they dont launch away
                    let force = (this.force) / (distance * distance);
                    //limit force to -1, 1
                    if (force > .98) force = .98;
                    if (force < -.98) force = -.98;

                    // Calculate acceleration
                    const accelerationX = dx * force * .9;
                    const accelerationY = dy * force * .9;

                    // Update velocity using acceleration and a time step
                    lifesource1.velocity.x += accelerationX * deltaTime;
                    lifesource1.velocity.y += accelerationY * deltaTime;
                } else {
                    lifesource1.velocity.x *= 0.8;
                    lifesource1.velocity.y *= 0.8;
                }
            }

            
            if ((lifesource1.position.x + lifesource1.velocity.x) < this.source1.boundingBox.min.x) lifesource1.velocity.x *= -1;
            if ((lifesource1.position.x + lifesource1.velocity.x) > this.source1.boundingBox.max.x) lifesource1.velocity.x *= -1;
            if ((lifesource1.position.y + lifesource1.velocity.y) < this.source1.boundingBox.min.y) lifesource1.velocity.y *= -1;
            if ((lifesource1.position.y + lifesource1.velocity.y) > this.source1.boundingBox.max.y) lifesource1.velocity.y *= -1;

            lifesource1.position = new THREE.Vector2(lifesource1.position.x + lifesource1.velocity.x, lifesource1.position.y + lifesource1.velocity.y);
            this.source1.setLifesourcePosition(lifesource1);
        }
    }

}