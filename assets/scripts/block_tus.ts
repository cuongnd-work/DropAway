import { _decorator, Component, Node, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('block_tus')
export class block_tus extends Component {
    @property(Node)
    node1: Node = null!;

    @property(Node)
    targetNode: Node = null!;

    @property(Node)
    node2: Node = null!;

    @property(Node)
    node3: Node = null!;

    @property(Node)
    pointer: Node = null!; // Node tay

    @property
    pointerOffset: Vec3 = new Vec3(0, 0.5, 0); // offset tay so với node1

    @property
    pointerOutsidePos: Vec3 = new Vec3(0, 2, 0); // vị trí tay ngoài màn hình

    @property
    moveDuration: number = 1;

    @property
    waitAtStart: number = 0.5;

    @property
    waitAtTarget: number = 0.5;

    private startPosition: Vec3 = new Vec3();

    start() {
        if (!this.node1 || !this.targetNode) return;

        this.startPosition = this.node1.position.clone();

        // Ẩn node2/node3 lúc đầu
        if (this.node2) this.node2.active = false;
        if (this.node3) this.node3.active = false;

        // Đặt tay ngoài màn hình
        if (this.pointer) this.pointer.setPosition(this.pointerOutsidePos);

        // Bắt đầu vòng lặp
        this.loopSequence();
    }

    loopSequence() {
        const targetPos = this.targetNode.position.clone();

        // Stage 1: Hand vào node1 và “nhấp” 1 lần để grab
        if (this.pointer) {

            this.pointer.active = true;
            tween(this.pointer)
                .to(0.3, { position: this.startPosition.clone().add(this.pointerOffset) }, { easing: 'smooth' })
                .call(() => {
                    const originalRot = this.pointer.eulerAngles.clone();
                    tween(this.pointer)
                        .to(0.1, { eulerAngles: new Vec3(originalRot.x, originalRot.y, originalRot.z + 15) })
                        .start();
                })
                .delay(this.waitAtStart)
                .call(() => {
                    this.startNode1Move();
                })
                .start();
        } else {
            tween(this).delay(this.waitAtStart).call(() => this.startNode1Move()).start();
        }
    }

    startNode1Move() {
        const targetPos = this.targetNode.position.clone();

        // Node2 active + scale lên
        if (this.node2) {
            this.node2.active = true;
            this.node2.setScale(0.1, 0.1, 0.1);
            tween(this.node2).to(0.2, { scale: new Vec3(1, 1, 1) }).start();
        }

        if (this.node3) {
            this.node3.active = false;
            this.node3.setScale(1, 1, 1);
        }

        // Stage 2: Node1 di chuyển tới target, hand kéo theo (giữ node1)
        if (this.pointer) {
            // Cập nhật hand theo node1 mỗi frame
            this.schedule(() => {
                if (this.pointer && this.node1) {
                    this.pointer.setPosition(this.node1.position.clone().add(this.pointerOffset));
                }
            }, 0); // 0 = mỗi frame
        }

        tween(this.node1)
            .to(this.moveDuration, { position: targetPos }, { easing: 'smooth' })
            .call(() => {
                // Khi node1 tới target → Stage 3
                if (this.node2) this.node2.active = false;

                if (this.node3) {
                    this.node3.active = true;
                    this.node3.setScale(1, 1, 1);
                    tween(this.node3).to(0.5, { scale: new Vec3(0, 0, 0) }).start();
                }

                // Stage 3: Hand thả và ra ngoài
                if (this.pointer) {
                    tween(this.pointer)
                        .to(0.1, { eulerAngles: new Vec3(0, 0, 0) })
                        .to(0.3, { position: this.pointerOutsidePos })
                        .call(() => {
                            this.pointer.active = false;
                            this.pointer.setRotationFromEuler(0, 0, 0)
                        })
                        .start();
                }
            })
            .delay(this.waitAtTarget)
            .call(() => {
                // Reset node1
                this.node1.setPosition(this.startPosition);
                this.node1.setScale(0.1, 0.1, 0.1);
                this.node1.setRotationFromEuler(0, 0, -20);
                this.playScaleAndRotateAndShake();

                // Lặp lại
                this.loopSequence();
            })
            .start();
    }

    playScaleAndRotateAndShake() {
        const scaleTween = tween(this.node1)
            .to(0.15, { scale: new Vec3(1.2, 1.2, 1.2) })
            .to(0.1, { scale: new Vec3(1, 1, 1) });

        const rotTween = tween(this.node1)
            .to(0.25, { eulerAngles: new Vec3(0, 0, 0) });

        tween(this.node1)
            .parallel(scaleTween, rotTween)
            .call(() => this.shakeEffect())
            .start();
    }

    shakeEffect() {
        const originalPos = this.node1.position.clone();
        const s = 0.05;

        tween(this.node1)
            .by(0.03, { position: new Vec3(s, 0, 0) })
            .by(0.03, { position: new Vec3(-s * 2, 0, 0) })
            .by(0.03, { position: new Vec3(s, 0, 0) })
            .call(() => this.node1.setPosition(originalPos))
            .start();
    }
}
