import {
    _decorator,
    Collider,
    ICollisionEvent,
    ITriggerEvent,
    MeshRenderer,
    Node,
    SkeletalAnimation,
    Tween,
    Vec2
} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {IHasColor} from "db://assets/scripts/entities/base/IHasColor";
import {PersonData} from "db://assets/scripts/level/level_data";
import {Hole} from "db://assets/scripts/entities/hole";
import {Elevator} from "db://assets/scripts/entities/elevator";
import {MaterialManager} from "db://assets/scripts/level/material_manager";

const {ccclass, property} = _decorator;

@ccclass('People')
export class People extends LifecycleComponent implements IEntities, IHasColor {
    color: number;
    position: Vec2;

    @property(MeshRenderer)
    private meshRenderer: MeshRenderer | null = null;

    @property(Node)
    public model: Node | null = null;

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
        if (!elevator) {
            this.position = data.position;
        } else {
            this.hitCollider.node.active = false;
            this.triggerCollider.node.active = false;
        }
        this.color = data.colorIndex;

        const materials = this.meshRenderer.materials;

        if (materials.length === 0) {
            console.warn('MeshRenderer has no materials!');
            return;
        }

        const newMat = MaterialManager.instance.getPeopleMaterial(this.color);

        this.meshRenderer.setMaterial(newMat, 0);

        this.hitCollider.on('onCollisionEnter', this._onHitEnter, this);
        this.hitCollider.on('onTriggerExit', this._onHitExit, this);
        this.triggerCollider.on('onTriggerEnter', this._onTriggerEnter, this);
        this.triggerCollider.on('onTriggerExit', this._onTriggerExit, this);
    }

    onDisable() {
        this.hitCollider.off('onCollisionEnter', this._onHitEnter, this);
        this.hitCollider.off('onTriggerExit', this._onHitExit, this);
        this.triggerCollider.off('onTriggerEnter', this._onTriggerEnter, this);
        this.triggerCollider.off('onTriggerExit', this._onTriggerExit, this);
    }

    private _onHitEnter(event: ICollisionEvent) {
        const hole = People._getHole(event.otherCollider.node);
        if (hole && !this.isCollected && hole.color === this.color) {
            this.hitCollider.isTrigger = true;
        }
    }

    private _onHitExit(event: ITriggerEvent) {
        const hole = People._getHole(event.otherCollider.node);
        if (hole && !this.isCollected) {
            this.hitCollider.isTrigger = false;
        }
    }

    private _onTriggerEnter(event: ITriggerEvent) {
        const hole = People._getHole(event.otherCollider.node);
        if (hole && !this.isCollected) {
            this.collect(hole);
        }
    }

    public collect(hole: Hole): boolean {
        if (this.tryCollect(hole)) {
            hole.tryCompleteHole();
            return true;
        }

        return false;
    }

    private _onTriggerExit(event: ITriggerEvent) {
        const hole = People._getHole(event.otherCollider.node);
        if (hole && !this.isCollected) {
        }
    }

    private static _getHole(node: Node): Hole {
        return node.parent.parent.getComponent(Hole);
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

    public doAnim() {
        const clip = this.skeletalAnim.clips[10];
        clip.wrapMode = 1;
        this.skeletalAnim.play(clip.name);
    }

    private tween: Tween = null;

    public doCollectedAnimation(hole: Hole) {
        if (this.elevator) {
            const worldPos = this.node.worldPosition.clone();

            this.node.parent = hole.node.parent;

            this.node.setWorldPosition(worldPos);
        }

        const clip = this.skeletalAnim.clips[6];
        clip.wrapMode = 1;
        this.skeletalAnim.play(clip.name);

        const duration = 0.6;
        const startPos = this.node.worldPosition.clone();

        this.tween = new Tween({t: 0})
            .to(duration, {t: 1}, {
                easing: 'sineIn',
                onUpdate: (target) => {
                    if(hole.getDropPoint()){
                        const currentTarget = hole.getDropPoint().worldPosition.clone();
                        const newPos = startPos.lerp(currentTarget, target.t);
                        this.node.position = newPos;

                        const scale = 0.6 + (1 - 0.6) * (1 - target.t);
                        this.node.setScale(scale, scale, scale);
                    }
                }
            })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    override onDestroy() {
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }
    }
}