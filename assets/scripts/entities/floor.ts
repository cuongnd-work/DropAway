import {_decorator, Vec2} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";

const {ccclass} = _decorator;

@ccclass('Floor')
export class Floor extends LifecycleComponent implements IEntities {
    position: Vec2 = new Vec2();
    
    private isStepped: boolean = false;
    
    public step(){
        
    }
}
