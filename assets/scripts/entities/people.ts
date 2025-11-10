import {_decorator, Vec2, Node, SkeletalAnimation, Tween, Vec3} from 'cc';
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

    @property(SkeletalAnimation)
    private skeletalAnim: SkeletalAnimation = null!;

    bindData(data: PersonData): void {
        this.position = data.position;
        this.color = data.colorIndex;
    }

    public tryCollect(hole: Hole): boolean {
        if (!this.isCollected && hole.color == this.color) {
            this.doCollectedAnimation(hole);
            this.isCollected = true;

            return true;
        }
        return false;
    }

    private doCollectedAnimation(hole: Hole) {
        this.collider.active = false;

        const clip = this.skeletalAnim.clips[6];
        clip.wrapMode = 1;
        const clipName = clip.name;

        this.skeletalAnim.play(clipName);
        
        let currentPos = this.node.worldPosition;

        this.node.setParent(hole.getDropPoint());
        this.node.setWorldPosition(currentPos);
        
        const targetPos = new Vec3(0,0,0);
        const duration = 0.6;

        Tween.stopAllByTarget(this.node);
        new Tween(this.node)
            .parallel(
                new Tween(this.node)
                    .to(duration, { position: targetPos }, { easing: 'sineIn' }),
                new Tween(this.node)
                    .to(duration, { scale: new Vec3(0.5, 0.5, 0.5) }, { easing: 'sineIn' })
            )
            .call(() => {
                this.node.active = false;
            })
            .start();
    }
}