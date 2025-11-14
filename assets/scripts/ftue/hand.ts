import { _decorator, Component, Node, Vec3, tween, input, Input, Quat, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('hand')
export class hand extends Component {

    @property([Node])
    targets: Node[] = [];

    @property([Vec3])
    rotations: Vec3[] = [];

    @property
    moveDuration: number = 0.5;

    @property
    rotateDuration: number = 0.25;

    private _currentIndex: number = 0;
    private _stopLoop: boolean = false;

    private _currentTween: Tween<Node> | null = null;   // ⭐ Lưu tween hiện tại

    start() {
        input.on(Input.EventType.TOUCH_START, this.onClick, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onClick, this);

        if (this.targets.length > 0) {
            this.node.active = true;
            this._currentIndex = 0;
            this._stopLoop = false;

            const firstTarget = this.targets[0];
            if (firstTarget) {
                this.node.setWorldPosition(firstTarget.getWorldPosition());
            }

            this.moveToNextTarget();
        }
    }

    moveToNextTarget() {
        if (this._stopLoop || this.targets.length === 0) return;

        const index = this._currentIndex;
        const targetNode = this.targets[index];
        if (!targetNode) return;

        // ⭐ Lưu tween
        this._currentTween = tween(this.node)
            .to(this.moveDuration, { worldPosition: targetNode.getWorldPosition().clone() })
            .call(() => this.rotateAtPoint(index))
            .start();
    }

    rotateAtPoint(index: number) {
        if (this.rotations.length > index) {
            const rotVec = this.rotations[index];
            const targetRot = new Quat();
            Quat.fromEuler(targetRot, rotVec.x, rotVec.y, rotVec.z);

            this._currentTween = tween(this.node)
                .to(this.rotateDuration, { rotation: targetRot })
                .call(() => {
                    this._currentIndex = (this._currentIndex + 1) % this.targets.length;
                    if (!this._stopLoop) this.moveToNextTarget();
                    else this.node.active = false;
                })
                .start();
        } else {
            this._currentIndex = (this._currentIndex + 1) % this.targets.length;
            if (!this._stopLoop) this.moveToNextTarget();
            else this.node.active = false;
        }
    }

    onClick() {
        this._stopLoop = true;

        if (this._currentTween) {
            this._currentTween.stop();
            this._currentTween = null;
        }

        this.node.active = false;
        if (this.node.parent) this.node.parent.active = false;
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onClick, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onClick, this);
    }
}
