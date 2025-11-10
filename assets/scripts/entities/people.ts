import {_decorator, Vec2, Node} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {IHasColor} from "db://assets/scripts/entities/base/IHasColor";
import {ColorPreset} from "./base/colorPreset";
import {PersonData} from "db://assets/scripts/level/level_data";
import {Hole} from "db://assets/scripts/entities/hole";

const {ccclass, property} = _decorator;

@ccclass('People')
export class People extends LifecycleComponent implements IEntities, IHasColor {
    color: number;
    position: Vec2;

    public isCollected: boolean = false;

    @property(Node)
    private collider: Node = null!;

    bindData(data: PersonData): void {
        this.position = data.position;
        this.color = data.colorIndex;
    }

    public tryCollect(hole: Hole): boolean {
        if (!this.isCollected && hole.color == this.color) {
            this.doCollectedAnimation(hole);

            return true;
        }
        return false;
    }

    private doCollectedAnimation(hole: Hole) {
        this.collider.active = false;
        
    }
}