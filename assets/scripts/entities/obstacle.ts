import {_decorator, Vec2} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";

const {ccclass} = _decorator;

@ccclass('Obstacle')
export class Obstacle extends LifecycleComponent implements IEntities {
    position: Vec2 = new Vec2();
}
