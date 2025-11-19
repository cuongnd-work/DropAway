import { _decorator, Component, Node, input, Input, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('disable_onclick')
export class disable_onclick extends Component {

    private _timer: number | null = null;

    start() {
        input.on(Input.EventType.TOUCH_START, this.onClick, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onClick, this);
    }

    onClick() {
        this.node.active = false;

        if (this._timer !== null) {
            clearTimeout(this._timer);
        }

        this._timer = setTimeout(() => {
            this.node.active = true;
        }, 3000);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onClick, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onClick, this);

        if (this._timer !== null) {
            clearTimeout(this._timer);
        }
    }
}
