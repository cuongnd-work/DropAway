import { _decorator, Node, Prefab, PhysicsSystem, Vec2, Vec3, RigidBody } from 'cc';
import { LifecycleComponent } from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import { IEntities } from "db://assets/scripts/entities/base/IEntities";
import { IHasColor } from "db://assets/scripts/entities/base/IHasColor";
import { ColorPreset } from "./base/colorPreset";
import { IDragable } from "db://assets/scripts/entities/base/IDragable";
import { HoleData } from "db://assets/scripts/level/level_data";
import { object_pool_manager } from "db://assets/plugins/playable-foundation/game-foundation/object_pool";
import {HoleView} from "db://assets/scripts/entities/holeModel/holeView";
import {constant} from "db://assets/configs/constant";

const { ccclass, property } = _decorator;

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
    private _holeView : HoleView = null;

    public holeData: HoleData = null;
    color: ColorPreset;
    position: Vec2;
    
    beginDrag(): void {
        this._dragging = true;
        this._targetPos.set(this._holeView.node.worldPosition);
        this._rb.wakeUp();
        this._rb.linearFactor = new Vec3(1, 0, 1);
        this._holeView.beginDrag();
    }

    drag(worldPos: Vec3): void {
        if (!this._dragging) return;
        this._targetPos.set(worldPos.x, this._holeView.node.worldPosition.y, worldPos.z);
        this._holeView.drag();
    }

    endDrag(): void {
        if (!this._rb) return;
        this._dragging = false;
        this._rb.setLinearVelocity(Vec3.ZERO);
        this._rb.sleep();
        this._rb.linearFactor = new Vec3(0, 0, 0);
        this._holeView.endDrag();
    }
    
    override onTick(dt: number) {
        if (!this._dragging || !this._rb) return;

        const current = this._holeView.node.worldPosition;
        const next = new Vec3();
        Vec3.lerp(next, current, this._targetPos, dt * this.speed);

        const vel = new Vec3();
        Vec3.subtract(vel, next, current);
        vel.multiplyScalar(1 / dt);

        this._rb.setLinearVelocity(vel);
        this._holeView.updateHitBoxCollider(vel);
    }

    public bindData(data: HoleData): void {
        this.holeData = data;
        this._holeView = this.spawnModel(data).getComponent(HoleView);
        this._holeView.bindData(this);
        this._rb = this._holeView.getComponent(RigidBody);
        if (this._rb) {
            this._rb.useGravity = false;
            this._rb.angularFactor = new Vec3(0, 0, 0);
            this._rb.linearFactor = new Vec3(0, 0, 0);
            this._rb.sleep();
        }
        this._targetPos.set(this.node.worldPosition);

        this._holeView.node.setPosition(this.node.position.x, 0, this.node.position.z);
        this.node.setPosition(0, constant.GAME_PLAY.HOLE_OFFSET, 0);
    }

    private spawnModel(data: HoleData) {
        return object_pool_manager.instance.Spawn(
            this.holePrefabs[data.id],
            null,
            null,
            this.root
        );
    }
}
