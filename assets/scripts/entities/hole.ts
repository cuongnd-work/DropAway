import {_decorator, Collider, ICollisionEvent, Node, Prefab, RigidBody, Vec2, Vec3} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {IHasColor} from "db://assets/scripts/entities/base/IHasColor";
import {IDragable} from "db://assets/scripts/entities/base/IDragable";
import {HoleData} from "db://assets/scripts/level/level_data";
import {object_pool_manager} from "db://assets/plugins/playable-foundation/game-foundation/object_pool";
import {HoleView} from "db://assets/scripts/entities/holeModel/holeView";
import {constant} from "db://assets/configs/constant";
import {People} from "db://assets/scripts/entities/people";
import {LevelManager} from "db://assets/scripts/level/level_manager";

const {ccclass, property} = _decorator;

@ccclass('Hole')
export class Hole extends LifecycleComponent implements IEntities, IHasColor, IDragable {
    @property(Prefab)
    private holePrefabs: Prefab[] = [];

    @property(Node)
    private root: Node = null;

    @property
    speed: number = 10;

    private _rb: RigidBody | null = null;
    private _targetPos = new Vec3();
    private _dragging = false;
    
    public isComplete: boolean = false;
    public holeView: HoleView = null;
    public holeData: HoleData = null;
    color: number;
    position: Vec2;

    private _slotContain: number = 0;
    private _slotMax: number = 0;

    private onCollisionEnter(event: ICollisionEvent) {
        if(this.isComplete) return;
        let people = event.otherCollider.node.parent.getComponent(People);
        if (people) {
            if (people.tryCollect(this)) {
                this.tryCompleteHole();
            }
        }
    }

    private tryCompleteHole(): void {
        this._slotContain++;
        if (this._slotContain >= this._slotMax){
            this.completeHole();
            LevelManager.instance.checkLevelCompleted();
        }
    }

    private completeHole() {
        this.isComplete = true;

        setTimeout(() => {
            this.holeView.OnComplete();
        }, 500);
    }

    beginDrag(): void {
        if(this.isComplete) return;
        this._dragging = true;
        this._targetPos.set(this.holeView.node.worldPosition);
        this._rb.wakeUp();
        this._rb.linearFactor = new Vec3(1, 0, 1);
        this.holeView.beginDrag();
    }

    drag(worldPos: Vec3): void {
        if(this.isComplete) return;
        if (!this._dragging) return;
        this._targetPos.set(worldPos.x, this.holeView.node.worldPosition.y, worldPos.z);
        this.holeView.drag();
    }

    endDrag(): void {
        if(this.isComplete) return;
        if (!this._rb) return;
        this._dragging = false;
        this._rb.setLinearVelocity(Vec3.ZERO);
        this._rb.sleep();
        this._rb.linearFactor = new Vec3(0, 0, 0);
        this.holeView.endDrag();
    }

    override onTick(dt: number) {
        if (!this._dragging || !this._rb) return;

        const current = this.holeView.node.worldPosition;
        const next = new Vec3();
        Vec3.lerp(next, current, this._targetPos, dt * this.speed);

        const vel = new Vec3();
        Vec3.subtract(vel, next, current);
        vel.multiplyScalar(1 / dt);

        this._rb.setLinearVelocity(vel);
        this.holeView.updateHitBoxCollider(vel);
    }

    public bindData(data: HoleData): void {
        this.holeData = data;
        this.position = data.position;
        this.color = data.colorIndex;
        this.holeView = this.spawnModel(data).getComponent(HoleView);
        this.holeView.bindData(this);
        this._slotMax = this.holeView.maxPeopleInHole;
        this._rb = this.holeView.getComponent(RigidBody);
        if (this._rb) {
            this._rb.useGravity = false;
            this._rb.angularFactor = new Vec3(0, 0, 0);
            this._rb.linearFactor = new Vec3(0, 0, 0);
            this._rb.sleep();
        }
        this._targetPos.set(this.node.worldPosition);

        this.holeView.node.setPosition(this.node.position.x, 0, this.node.position.z);
        this.node.setPosition(0, constant.GAME_PLAY.HOLE_OFFSET, 0);

        const collider = this.holeView.getComponent(Collider);
        if (collider) {
            collider.on('onCollisionEnter', this.onCollisionEnter, this);
        }
    }

    protected onDispose() {
        const collider = this.holeView.getComponent(Collider);
        if (collider) {
            collider.off('onCollisionEnter', this.onCollisionEnter, this);
        }
    }

    private spawnModel(data: HoleData) {
        return object_pool_manager.instance.Spawn(
            this.holePrefabs[data.id],
            null,
            null,
            this.root
        );
    }

    public getDropPoint(): Node {
        return this.holeView.dropPoint;
    }
}
