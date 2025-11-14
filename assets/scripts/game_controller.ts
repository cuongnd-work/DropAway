import { _decorator, Component, SceneAsset, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('game_controller')
export class game_controller extends Component {

    @property(SceneAsset)
    sceneToLoad: SceneAsset = null!;

    public loadScene() {
        if (!this.sceneToLoad) {
            console.warn("⚠️ sceneToLoad is NULL! Bạn chưa kéo scene vào Inspector.");
            return;
        }

        const sceneName = this.sceneToLoad.name;
        if (!sceneName) {
            console.warn("⚠️ SceneAsset không có name hợp lệ!");
            return;
        }

        director.loadScene(sceneName);
    }
}
