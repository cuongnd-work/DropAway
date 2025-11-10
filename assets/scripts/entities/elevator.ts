import {_decorator, math, Prefab, Node} from 'cc';
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
    
    public peoples: People[] = [];

    public bindData(datas: ElevatorData) {
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
    }
}