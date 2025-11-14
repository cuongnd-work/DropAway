import {_decorator, Collider, ITriggerEvent, Label, math, Node, Prefab, tween, Vec3} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {ElevatorData} from "db://assets/scripts/level/level_data";
import {People} from "db://assets/scripts/entities/people";
import {object_pool_manager} from "db://assets/plugins/playable-foundation/game-foundation/object_pool";
import {Hole} from "db://assets/scripts/entities/hole";

const {ccclass, property} = _decorator;

@ccclass('Elevator')
export class Elevator extends LifecycleComponent implements IEntities {
    position: math.Vec2;
    
    @property(Prefab)
    private peoplePrefab: Prefab = null;

    @property(Node)
    private root: Node = null;

    @property(Label)
    private text: Label = null;

    @property(Node)
    private view: Node = null;

    @property(Collider)
    private hit_collider: Collider = null;

    @property(Vec3)
    private root_position_offset: Vec3[] = [];

    @property(Vec3)
    private root_rotation_offset: Vec3[] = [];

    public peoples: People[] = [];

    private peopleOffset: number = 0.6;

    public bindData(datas: ElevatorData, maxXGrid: number, maxYGrid: number) {

        let offset = 0;
        let index = 0;

        for (let data of datas.people) {
            let people = object_pool_manager.instance.Spawn(
                this.peoplePrefab,
                null,
                null,
                this.root
            ).getComponent(People);

            this.peoples.push(people);
            people.node.setPosition(0,0, -offset);
            people.node.active = index < 2;
            offset += this.peopleOffset;
            index++;

            people.bindData(data, this);
        }

        if (!this.view) return;

        const x = this.position.x;
        const y = this.position.y;

        const distLeft = x;
        const distRight = maxXGrid - 1 - x;
        const distBottom = y;
        const distTop = maxYGrid - 1 - y;

        const minDist = Math.min(distLeft, distRight, distBottom, distTop);
        let angleY = 0;

        const offsetPos = -1;
        let pos = new Vec3(0,0,0);

        if (minDist === distTop) {
            angleY = 0;
            pos = new Vec3(0,0,offsetPos);
            this.peoples.forEach(person => {
                person.model.setPosition(this.root_position_offset[0]);
                person.model.setRotationFromEuler(this.root_rotation_offset[0]);
            })
        } else if (minDist === distRight) {
            pos = new Vec3(-offsetPos,0,0);
            angleY = -90;
            this.peoples.forEach(person => {
                person.model.setPosition(this.root_position_offset[2]);
                person.model.setRotationFromEuler(this.root_rotation_offset[2]);
            })

        } else if (minDist === distBottom) {
            pos = new Vec3(0,0,-offsetPos);
            angleY = 180;
            this.peoples.forEach(person => {
                person.model.setPosition(this.root_position_offset[3]);
                person.model.setRotationFromEuler(this.root_rotation_offset[3]);
            })

        } else if (minDist === distLeft) {
            pos = new Vec3(offsetPos,0,0);
            angleY = 90;
            this.peoples.forEach(person => {
                person.model.setPosition(this.root_position_offset[1]);
                person.model.setRotationFromEuler(this.root_rotation_offset[1]);
            })
        }

        this.view.setRotationFromEuler(0, angleY, 0);
        this.view.setPosition(pos);

        this.hit_collider.on('onTriggerEnter', this.onTriggerEnter, this);
        this.hit_collider.on('onTriggerExit', this.onTriggerExit, this);

        this.text.string = datas.people.length.toString();
    }

    triggerPeopleComplete(people: People) {
        this.text.string = (this.peoples.length - 1).toString();

        const index = this.peoples.indexOf(people);
        if (index === -1) return;

        this.peoples.splice(index, 1);

        for (let i = index; i < this.peoples.length; i++) {
            const p = this.peoples[i];
            const p2 = this.peoples[i + 1];
            const targetPos = new Vec3(0, 0, -i * this.peopleOffset);
            p.node.active = true;
            if(p2) p2.node.active = true;

            people.doAnim();

            tween(p.node)
                .to(0.2, {position: targetPos}, {easing: 'quadOut'})
                .start();
        }
    }

    private isMoving: boolean = false;

    private async onTriggerEnter(event: ITriggerEvent) {
        let hole = event.otherCollider.node.parent.parent.getComponent(Hole);
        if (hole) {
            this.isMoving = true;
            this.onCollect(hole);
        }
    }

    private async onCollect(hole: Hole){
        if(this.peoples.length == 0 || !this.isMoving || hole.isComplete) return;
        if(this.peoples[0].collect(hole)){
            await new Promise<void>(resolve => setTimeout(resolve, 400));
            this.onCollect(hole);
        }
    }

    private onTriggerExit() {
        this.isMoving = false;
    }
}