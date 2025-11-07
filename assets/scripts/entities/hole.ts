import { _decorator, Node, Prefab, Quat, Vec2, Vec3, RigidBody } from 'cc';
import { LifecycleComponent } from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import { IEntities } from "db://assets/scripts/entities/base/IEntities";
import { IHasColor } from "db://assets/scripts/entities/base/IHasColor";
import { ColorPreset } from "./base/colorPreset";
import { IDragable } from "db://assets/scripts/entities/base/IDragable";
import { HoleData } from "db://assets/scripts/level/level_data";
import { object_pool_manager } from "db://assets/plugins/playable-foundation/game-foundation/object_pool";

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

    public holeData: HoleData = null;
    color: ColorPreset;
    position: Vec2;

    override onStart() {
        this._rb = this.getComponent(RigidBody);
        if (this._rb) {
            this._rb.useGravity = false;
        }
        this._targetPos.set(this.node.worldPosition);
    }

    beginDrag(): void {
        this._dragging = true;
        this._targetPos.set(this.node.worldPosition);
        console.log("🟢 Begin drag:", this.holeData?.position);
    }

    drag(worldPos: Vec3): void {
        if (!this._dragging) return;
        this._targetPos.set(worldPos.x, this.node.worldPosition.y, worldPos.z);
    }

    endDrag(): void {
        if (!this._rb) return;
        this._dragging = false;
        this._rb.setLinearVelocity(Vec3.ZERO);
        console.log("🔴 End drag");
    }

    override onTick(dt: number) {
        if (!this._dragging || !this._rb) return;

        const current = this.node.worldPosition;
        const next = new Vec3();
        Vec3.lerp(next, current, this._targetPos, dt * this.speed);

        const vel = new Vec3();
        Vec3.subtract(vel, next, current);
        vel.multiplyScalar(1 / dt);

        this._rb.setLinearVelocity(vel);
    }

    public bindData(data: HoleData): void {
        this.holeData = data;
        this.spawnModel(data);
        this.node.setPosition(this.node.position.x, 0.1, this.node.position.z);
    }

    private spawnModel(data: HoleData) {
        object_pool_manager.instance.Spawn(
            this.holePrefabs[data.id],
            null,
            null,
            this.root
        );
    }
}
