import {_decorator, Collider, ICollisionEvent, SkeletalAnimation, Tween, Vec2} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {IHasColor} from "db://assets/scripts/entities/base/IHasColor";
import {PersonData} from "db://assets/scripts/level/level_data";
import {Hole} from "db://assets/scripts/entities/hole";
import {Elevator} from "db://assets/scripts/entities/elevator";

const { ccclass, property } = _decorator;

@ccclass('People')
export class People extends LifecycleComponent implements IEntities, IHasColor {
    color: number;
    position: Vec2;

    public isCollected: boolean = false;

    @property(Collider)
    private hitCollider: Collider = null!;

    @property(Collider)
    private triggerCollider: Collider = null!;

    @property(SkeletalAnimation)
    private skeletalAnim: SkeletalAnimation = null!;

    private elevator: Elevator | null = null;
    private _holeInTrigger: Hole | null = null;

    bindData(data: PersonData, elevator?: Elevator): void {
        this.elevator = elevator;
        if (!elevator) this.position = data.position;
        this.color = data.colorIndex;
    }

    override onStart() {
        this.hitCollider.on('onCollisionEnter', this._onHitEnter, this);
        this.hitCollider.on('onCollisionExit', this._onHitExit, this);
        this.triggerCollider.on('onCollisionEnter', this._onTriggerEnter, this);
        this.triggerCollider.on('onCollisionExit', this._onTriggerExit, this);
    }

    onDisable() {
        this.hitCollider.off('onCollisionEnter', this._onHitEnter, this);
        this.hitCollider.off('onCollisionExit', this._onHitExit, this);
        this.triggerCollider.off('onCollisionEnter', this._onTriggerEnter, this);
        this.triggerCollider.off('onCollisionExit', this._onTriggerExit, this);
    }

    private _onHitEnter(event: ICollisionEvent) {
        if (this.elevator) return;
        const hole = event.otherCollider.node.parent.parent.getComponent(Hole);
        if (hole && !this.isCollected && hole.color === this.color) {
            if(this.elevator) this._onTriggerEnter(event);
            this.hitCollider.isTrigger = true;
        }
    }

    private _onHitExit(event: ICollisionEvent) {
        if (this.elevator) return;
        const hole = event.otherCollider.node.parent.parent.getComponent(Hole);
        if (hole && !this.isCollected) {
            this.hitCollider.isTrigger = false;
        }
    }

    private _onTriggerEnter(event: ICollisionEvent) {
        if (this.elevator) return;
        const hole = event.otherCollider.node.parent.parent.getComponent(Hole);
        if (hole && !this.isCollected) {
            this.collect(hole);
        }
    }

    public collect(hole: Hole): boolean {
        if(this.tryCollect(hole)){
            hole.tryCompleteHole();
            return true;
        }

        return false;
    }

    private _onTriggerExit(event: ICollisionEvent) {
        if (this.elevator) return;
        const hole = event.otherCollider.node.parent.parent.getComponent(Hole);
        if (hole && !this.isCollected) {
        }
    }

    public tryCollect(hole: Hole): boolean {
        if (!this.isCollected && hole.color == this.color) {
            this.doCollectedAnimation(hole);
            this.isCollected = true;
            if (this.elevator) this.elevator.triggerPeopleComplete(this);
            return true;
        }
        return false;
    }

    public doCollectedAnimation(hole: Hole) {
        const clip = this.skeletalAnim.clips[6];
        clip.wrapMode = 1;
        this.skeletalAnim.play(clip.name);

        const duration = 0.6;
        const startPos = this.node.worldPosition.clone();

        const tween = new Tween({ t: 0 })
            .to(duration, { t: 1 }, {
                easing: 'sineIn',
                onUpdate: (target) => {
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