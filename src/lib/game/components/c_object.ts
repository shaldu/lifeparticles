//@ts-ignore
import { Mesh } from 'three';
import { Types, Component } from 'ecsy';
//@ts-ignore
import * as THREE from 'three';

export class C_Object<CO extends { name: string }> extends Component<CO>
{

}

C_Object.schema = {
    mesh: { type: Types.Ref }
}