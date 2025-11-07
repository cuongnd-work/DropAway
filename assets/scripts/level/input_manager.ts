import {_decorator, Camera, Layers, EventTouch, geometry, input, Input, PhysicsSystem, Vec3} from 'cc';
import {
    LifecycleComponent,
    register_lifecycle
} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {Hole} from "db://assets/scripts/entities/hole";
import {IDragable} from "db://assets/scripts/entities/base/IDragable";

const {ccclass, property} = _decorator;

@ccclass('InputManager')
@register_lifecycle()
export class InputManager extends LifecycleComponent {
    @property(Camera)
    public camera: Camera | null = null;

    private _ray = new geometry.Ray();
    private _hitPos = new Vec3();
    private _dragTarget: Hole | null = null;

    override onStart() {
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
        if (!this.camera) return;
        const location = event.getLocation();
        const x = location.x;
        const y = location.y;

        this.camera.screenPointToRay(x, y, this._ray);
        this._doRaycast();
    }
    
    private _onTouchDrag(e: EventTouch) {
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
        if (!this._dragTarget) return;
        this._dragTarget.endDrag();
        this._dragTarget = null;
    }

    private _doRaycast() {
        const mask = 1 << Layers.nameToLayer('INPUT_TRIGGER');

        if (PhysicsSystem.instance.raycastClosest(this._ray, mask)) {
            const r = PhysicsSystem.instance.raycastClosestResult;
            if (r) {
                this._hitPos.set(r.hitPoint);
                
                const hole = r.collider.node.parent.parent.parent.getComponent(Hole);
                
                if(!hole) return;
                hole.beginDrag();

                this._dragTarget = hole ?? null;
                
                console.log(
                    `%c🎯 Hit: ${r.collider.node.name}`,
                    'color: lime',
                    '\n• Distance:', r.distance.toFixed(3),
                    '\n• Point:', r.hitPoint,
                    '\n• Normal:', r.hitNormal
                );
            }
        }
    }
}