import {_decorator, Component, RigidBody, Vec3, Node} from 'cc';
import {Hole} from "db://assets/scripts/entities/hole";

const {ccclass, property} = _decorator;

@ccclass('HoleView')
export class HoleView extends Component {
    @property({tooltip: "ID của hole", displayName: "Hole ID"})
    private id: string = "";

    @property(Node)
    private hit_box: Node = null;

    private hole: Hole = null;
    
    public bindData(data: Hole) {
        this.hole = data;
    }
    
    public updateHitBoxCollider(vel : Vec3) : void{
        if (!this.hit_box) return;

        this.hit_box.setWorldPosition(this.node.worldPosition);
        this.hit_box.setWorldRotation(this.node.worldRotation);
    }
}
