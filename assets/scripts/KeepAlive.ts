import { _decorator, Component, Node, game } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('KeepAlive')
export class KeepAlive extends Component {
    start() {
        game.addPersistRootNode(this.node);
    }
}
