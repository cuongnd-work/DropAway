import { _decorator, Component, Node, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('faild')
export class faild extends Component {

    @property(Node)
    spriteNode: Node = null!;  // kéo sprite muốn đập vào màn hình

    @property(Vec3)
    targetPosition: Vec3 = new Vec3(0, 0, 0); // vị trí cuối cùng trên màn hình

    @property
    duration: number = 0.5;  // thời gian bay vào

    @property
    bounceScale: number = 1.2; // scale khi đập vào

    start() {
        if (!this.spriteNode) return;

        // đặt sprite ngoài màn hình trước khi tween
        this.spriteNode.setPosition(0, 600, 0); // ví dụ từ trên xuống

        // chạy tween đập vào màn hình
        tween(this.spriteNode)
            .to(this.duration, { position: this.targetPosition.clone(), scale: new Vec3(this.bounceScale, this.bounceScale, 1) }, { easing: 'backOut' })
            .to(0.2, { scale: new Vec3(1, 1, 1) }) // bounce về scale 1
            .start();
    }
}
