import {_decorator, math} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {IHasColor} from "db://assets/scripts/entities/base/IHasColor";
import { ColorPreset } from "./base/colorPreset";
import {IDragable} from "db://assets/scripts/entities/base/IDragable";

const {ccclass, property} = _decorator;

@ccclass('Hole')
export class Hole extends LifecycleComponent implements IEntities, IHasColor, IDragable {
    beginDrag(): void {
        throw new Error("Method not implemented.");
    }
    drag(): void {
        throw new Error("Method not implemented.");
    }
    endDrag(): void {
        throw new Error("Method not implemented.");
    }
    color: ColorPreset;
    position: math.Vec2;
}