import {_decorator, Node, Prefab, Quat, Vec2, Vec3} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {IHasColor} from "db://assets/scripts/entities/base/IHasColor";
import {ColorPreset} from "./base/colorPreset";
import {IDragable} from "db://assets/scripts/entities/base/IDragable";
import {HoleData} from "db://assets/scripts/level/level_data";
import {object_pool_manager} from "db://assets/plugins/playable-foundation/game-foundation/object_pool";

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

    public bindData(data: HoleData): void {
        this.holeData = data;
        this.spawnModel(data);
    }

    color: ColorPreset;
    position: Vec2;

    private spawnModel(data: HoleData) {
        let rot = new Vec3(0, data.rotation * 90, 0);
        let q = new Quat();
        object_pool_manager.instance.Spawn(this.holePrefabs[data.id], null, null
            , this.root);
    }
}