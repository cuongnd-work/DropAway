import {_decorator, Vec2, Node} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {Floor} from "db://assets/scripts/entities/floor";

const {ccclass, property} = _decorator;

@ccclass('Obstacle')
export class Obstacle extends LifecycleComponent implements IEntities {
    position: Vec2 = new Vec2();
    
    @property(Node)
    private right: Node = null;

    @property(Node)
    private left: Node = null;

    @property(Node)
    private top: Node = null;

    @property(Node)
    private bottom: Node = null;

    public setupInit(neighbors: IEntities[]): void {
        console.log("Initializing Obstacle " + neighbors.length + " neighbors");

        this.top.active = false;
        this.bottom.active = false;
        this.left.active = false;
        this.right.active = false;

        const topPos = new Vec2(this.position.x, this.position.y + 1);
        const bottomPos = new Vec2(this.position.x, this.position.y - 1);
        const leftPos = new Vec2(this.position.x - 1, this.position.y);
        const rightPos = new Vec2(this.position.x + 1, this.position.y);

        const hasTopNeighbor = neighbors.some(n => n.position.equals(topPos));
        const hasBottomNeighbor = neighbors.some(n => n.position.equals(bottomPos));
        const hasLeftNeighbor = neighbors.some(n => n.position.equals(leftPos));
        const hasRightNeighbor = neighbors.some(n => n.position.equals(rightPos));

        if (!hasTopNeighbor) this.top.active = true;
        if (!hasBottomNeighbor) this.bottom.active = true;
        if (!hasLeftNeighbor) this.left.active = true;
        if (!hasRightNeighbor) this.right.active = true;
    }
}
