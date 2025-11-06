import {_decorator, Component} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('HoleView')
export class HoleView extends Component {
    @property({tooltip: "ID của hole", displayName: "Hole ID"})
    private id: string = "";
}
