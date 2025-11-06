import {_decorator, math} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {IHasColor} from "db://assets/scripts/entities/base/IHasColor";
import {ColorPreset} from "./base/colorPreset";

const {ccclass, property} = _decorator;

@ccclass('People')
export class People extends LifecycleComponent implements IEntities, IHasColor {
    color: ColorPreset;
    position: math.Vec2;
}