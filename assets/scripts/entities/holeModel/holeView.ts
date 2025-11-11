import {_decorator, Component, Tween, Vec3, Node, tween, Collider} from 'cc';
import {Hole} from "db://assets/scripts/entities/hole";
import {LevelManager} from "db://assets/scripts/level/level_manager";
import {Floor} from "db://assets/scripts/entities/floor";
import {constant} from "db://assets/configs/constant";

const {ccclass, property} = _decorator;

@ccclass('HoleView')
export class HoleView extends Component {
    @property({tooltip: "ID của hole", displayName: "Hole ID"})
    private id: string = "";

    @property(Node)
    public hit_box: Node = null;

    @property(Node)
    public dropPoint: Node = null;

    @property(Node)
    public doors: Node[] = [];

    @property
    public maxPeopleInHole: number = 1;

    private hole: Hole = null;

    private _currentTween: Tween<Node> | null = null;

    public bindData(data: Hole) {
        this.hole = data;
    }
    
    public updateHitBoxCollider(vel : Vec3) : void{
        if (!this.hit_box) return;

        this.hit_box.setWorldPosition(this.node.worldPosition);
        this.hit_box.setWorldRotation(this.node.worldRotation);
    }

    beginDrag(): void {
        if(this.hole.isComplete) return;
        if (this._currentTween) {
            this._currentTween.stop();
            this._currentTween = null;
        }
    }

    drag(): void {
        if(this.hole.isComplete) return;
        this.CheckFloorStep();
        this.CheckPeopleJump();
    }

    endDrag(): void {
        if(this.hole.isComplete) return;
        if (!LevelManager.instance.floors || LevelManager.instance.floors.length === 0) return;

        const nodePos = this.node.worldPosition;
        let nearestFloor: Floor | null = null;
        let minDist = Number.MAX_VALUE;
        const tempVec = new Vec3();

        for (const floor of LevelManager.instance.floors) {
            const floorPos = floor.node.worldPosition;
            Vec3.subtract(tempVec, nodePos, floorPos);
            const dist = tempVec.length();
            if (dist < minDist) {
                minDist = dist;
                nearestFloor = floor;
            }
        }

        if (!nearestFloor) return;

        const targetPos = nearestFloor.node.worldPosition.clone();
        targetPos.y = constant.GAME_PLAY.HOLE_OFFSET;

        if (this._currentTween) {
            this._currentTween.stop();
        }

        this._currentTween = tween(this.node)
            .to(0.25, { worldPosition: targetPos }, { easing: 'quadOut' })
            .call(() => {
                this._currentTween = null;
            })
            .start();

        if (nearestFloor) {
            this.node.setWorldPosition(nearestFloor.node.worldPosition);
            this.node.setPosition(this.node.position.x, 0, this.node.position.z);
        }
    }

    private CheckFloorStep() {
    }

    private CheckPeopleJump() {
    }

    public OnComplete() {
        const tweenPromises = this.doors.map(door => {
            return new Promise<void>(resolve => {
                tween(door)
                    .to(0.25, { scale: new Vec3(1, 1, 1) }, { easing: 'quadOut' })
                    .call(() => resolve())
                    .start();
            });
        });

        Promise.all(tweenPromises).then(() => {
            tween(this.node)
                .to(0.25, { scale: new Vec3(0, 0, 0) }, { easing: 'quadIn' })
                .call(() => this.node.active = false)
                .start();
        });
    }
}
