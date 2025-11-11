import {_decorator, Node, SkeletalAnimation, Tween, Vec2} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {IHasColor} from "db://assets/scripts/entities/base/IHasColor";
import {PersonData} from "db://assets/scripts/level/level_data";
import {Hole} from "db://assets/scripts/entities/hole";
import {Elevator} from "db://assets/scripts/entities/elevator";

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

    private elevator: Elevator | null = null;

    bindData(data: PersonData, elevator?: Elevator): void {
        this.elevator = elevator;
        if(!elevator) this.position = data.position;
        this.color = data.colorIndex;
    }

    public tryCollect(hole: Hole): boolean {
        if (!this.isCollected && hole.color == this.color) {
            this.doCollectedAnimation(hole);
            this.isCollected = true;
            if(this.elevator) this.elevator.triggerPeopleComplete(this);

            return true;
        }
        return false;
    }

    public doCollectedAnimation(hole: Hole) {
        this.collider.active = false;

        const clip = this.skeletalAnim.clips[6];
        clip.wrapMode = 1;
        this.skeletalAnim.play(clip.name);

        const duration = 0.6;
        const startPos = this.node.worldPosition.clone();

        let elapsed = 0;
        const tween = new Tween({t: 0})
            .to(duration, {t: 1}, {
                easing: 'sineIn',
                onUpdate: (target) => {
                    elapsed = target.t * duration;

                    const currentTarget = hole.getDropPoint().worldPosition.clone();
                    const newPos = startPos.lerp(currentTarget, target.t);

                    this.node.position = newPos;

                    const scale = 0.6 + (1 - 0.6) * (1 - target.t);
                    this.node.setScale(scale, scale, scale);
                }
            })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }


}