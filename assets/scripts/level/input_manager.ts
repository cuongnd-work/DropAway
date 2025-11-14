import {_decorator, Camera, EventTouch, geometry, input, Input, Layers, Node, PhysicsSystem, Vec3} from 'cc';
import {
    LifecycleComponent,
    register_lifecycle
} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {Hole} from "db://assets/scripts/entities/hole";

const {ccclass, property} = _decorator;

@ccclass('InputManager')
@register_lifecycle()
export class InputManager extends LifecycleComponent {
    @property(Camera)
    public camera: Camera | null = null;

    private _ray = new geometry.Ray();
    private _hitPos = new Vec3();
    private _dragTarget: Hole | null = null;

    public isLockInput: boolean = false;

    override onInitialize() {
        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchDrag, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
    }

    override onDispose() {
        input.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this._onTouchDrag, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchEnd, this);
    }

    private _onTouchStart(event: EventTouch) {
        if(this.isLockInput) return;

        if (!this.camera) return;
        const loc = event.getLocation();
        this.camera.screenPointToRay(loc.x, loc.y, this._ray);
        this._doRaycast();
    }

    private _onTouchDrag(e: EventTouch) {
        if(this.isLockInput) return;

        if (!this._dragTarget || !this.camera) return;
        const x = e.getLocationX();
        const y = e.getLocationY();

        this.camera.screenPointToRay(x, y, this._ray);

        const t = -this._ray.o.y / this._ray.d.y;
        const pos = new Vec3(
            this._ray.o.x + this._ray.d.x * t,
            0,
            this._ray.o.z + this._ray.d.z * t
        );

        this._dragTarget.drag(pos);
    }

    private _onTouchEnd() {
        if(this.isLockInput) return;

        if (!this._dragTarget) return;
        this._dragTarget.endDrag();
        this._dragTarget = null;
    }

    private _doRaycast() {
        if (!this.camera) return;

        const mask = 1 << Layers.nameToLayer('INPUT_TRIGGER');

        if (!PhysicsSystem.instance.raycast(this._ray, mask)) return;

        const results = PhysicsSystem.instance.raycastResults;
        if (!results || results.length === 0) return;

        let targetNode: Node | null = null;
        for (const r of results) {
            if (!r.collider) continue;

            const nodeLayer = r.collider.node.layer;
            if ((nodeLayer & mask) === 0) continue;

            targetNode = r.collider.node;
            break;
        }

        if (!targetNode) return;

        this._hitPos.set(targetNode.worldPosition);

        let cur: Node | null = targetNode;
        let hole: Hole | null = null;
        while (cur) {
            hole = cur.getComponent(Hole);
            if (hole) break;
            cur = cur.parent;
        }

        if (!hole) return;

        hole.beginDrag();
        this._dragTarget = hole;
    }
}
