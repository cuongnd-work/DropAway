import {_decorator, math} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {ColorPreset} from "./base/colorPreset";

const {ccclass} = _decorator;

@ccclass('Floor')
export class Floor extends LifecycleComponent implements IEntities {
    position: math.Vec2;
}
