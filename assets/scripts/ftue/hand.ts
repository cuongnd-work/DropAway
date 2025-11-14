import { _decorator, Component, Node, Vec3, tween, input, Input } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('hand')
export class hand extends Component {
    @property([Node])
    targets: Node[] = [];

    @property
    moveDuration: number = 0.5;

    private _currentIndex: number = 0;
    private _stopLoop: boolean = false;

    start() {
        input.on(Input.EventType.TOUCH_END, this.onClick, this);
        input.on(Input.EventType.MOUSE_UP, this.onClick, this);

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

        const targetNode = this.targets[this._currentIndex];
        if (!targetNode) return;

        tween(this.node)
            .to(this.moveDuration, { worldPosition: targetNode.getWorldPosition().clone() })
            .call(() => {
                this._currentIndex++;
                if (this._currentIndex >= this.targets.length) this._currentIndex = 0;

                if (!this._stopLoop) this.moveToNextTarget();
                else this.node.active = false;
            })
            .start();
    }

    onClick() {
        this._stopLoop = true;
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_END, this.onClick, this);
        input.off(Input.EventType.MOUSE_UP, this.onClick, this);
    }
}
