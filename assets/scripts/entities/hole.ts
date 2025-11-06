import {_decorator, Vec2, Prefab, Node} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {IHasColor} from "db://assets/scripts/entities/base/IHasColor";
import {ColorPreset} from "./base/colorPreset";
import {IDragable} from "db://assets/scripts/entities/base/IDragable";
import {HoleData} from "db://assets/scripts/level/level_data";

const {ccclass, property} = _decorator;

@ccclass('Hole')
export class Hole extends LifecycleComponent implements IEntities, IHasColor, IDragable {
    @property(Prefab)
    private holePrefabs: Prefab[] = [];

    @property(Node)
    private root: Node = null;

    public holeData: HoleData = null;

    beginDrag(): void {
    }

    drag(): void {
    }

    endDrag(): void {
    }

    color: ColorPreset;
    position: Vec2;
}