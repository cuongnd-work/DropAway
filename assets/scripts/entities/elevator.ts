import {_decorator, math, Prefab, Node, Vec3} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {ElevatorData} from "db://assets/scripts/level/level_data";
import {People} from "db://assets/scripts/entities/people";
import {object_pool_manager} from "db://assets/plugins/playable-foundation/game-foundation/object_pool";

const {ccclass, property} = _decorator;

@ccclass('Elevator')
export class Elevator extends LifecycleComponent implements IEntities {
    position: math.Vec2;
    
    @property(Prefab)
    private peoplePrefab: Prefab = null;

    @property(Node)
    private root: Node = null;

    @property(Node)
    private view: Node = null;
    
    public peoples: People[] = [];

    public bindData(datas: ElevatorData, maxXGrid: number, maxYGrid: number) {
        for (let data of datas.people) {
            let people = object_pool_manager.instance.Spawn(
                this.peoplePrefab,
                null,
                null,
                this.root
            ).getComponent(People);

            people.bindData(data);
            this.peoples.push(people);
        }

        if (!this.view) return;

        const x = this.position.x;
        const y = this.position.y;

        const distLeft = x;
        const distRight = maxXGrid - 1 - x;
        const distBottom = y;
        const distTop = maxYGrid - 1 - y;

        const minDist = Math.min(distLeft, distRight, distBottom, distTop);
        let angleY = 0;

        const offsetPos = -1;
        let pos = new Vec3(0,0,0);

        if (minDist === distTop) {
            angleY = 0;
            pos = new Vec3(0,0,offsetPos);
        } else if (minDist === distRight) {
            pos = new Vec3(-offsetPos,0,0);
            angleY = -90;
        } else if (minDist === distBottom) {
            pos = new Vec3(0,0,-offsetPos);
            angleY = 180;
        } else if (minDist === distLeft) {
            pos = new Vec3(offsetPos,0,0);
            angleY = 90;
        }

        this.view.setRotationFromEuler(0, angleY, 0);
        this.view.setPosition(pos);
    }
}