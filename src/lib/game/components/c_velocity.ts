//@ts-ignore
import { Types, Component } from 'ecsy';

export class C_Velocity<CV extends { name: string }> extends Component<CV>
{

}

C_Velocity.schema = {
    velocity: { type: Types.Number, default: 0 }
}