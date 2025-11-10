import {_decorator, Component, RigidBody} from 'cc';
import {Hole} from "db://assets/scripts/entities/hole";
import {HoleData} from "db://assets/scripts/level/level_data";

const {ccclass, property} = _decorator;

@ccclass('HoleView')
export class HoleView extends Component {
    @property({tooltip: "ID của hole", displayName: "Hole ID"})
    private id: string = "";
    
    @property(Hole)
    private hole: Hole = null;
    
    public bindData(data: HoleData) {
        
    }

}
