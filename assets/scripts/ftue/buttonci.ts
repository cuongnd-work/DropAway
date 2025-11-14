import { _decorator, Component, Button, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('buttonci')
export class buttonci extends Component {

    @property(Button)
    myButton: Button = null!;  // kéo Button vào Inspector

    start() {
        if (this.myButton) {
            this.myButton.node.on('click', this.onButtonClick, this);
        }
    }

    onButtonClick() {
        console.log("✅ Button được click!");
    }

    onDestroy() {
        if (this.myButton) {
            this.myButton.node.off('click', this.onButtonClick, this);
        }
    }

}
