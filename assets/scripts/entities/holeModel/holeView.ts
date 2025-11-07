import {_decorator, Component} from 'cc';
import {Hole} from "db://assets/scripts/entities/hole";

const {ccclass, property} = _decorator;

@ccclass('HoleView')
export class HoleView extends Component {
    @property({tooltip: "ID của hole", displayName: "Hole ID"})
    private id: string = "";
    
    @property(Hole)
    private hole: Hole = null;
}
