//@ts-ignore
import { Vector2Type } from '$lib/@types/game';
import { Types, Component } from 'ecsy';
//@ts-ignore
import * as THREE from 'three';


export class C_Position<CP extends { name: string }> extends Component<CP>
{

}

C_Position.schema = {
    position: { type: Vector2Type, default: new THREE.Vector2(0, 0)}
}