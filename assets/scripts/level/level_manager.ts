import {_decorator, JsonAsset, warn, Node} from 'cc';
import {LevelData} from './level_data';
import {
    LifecycleComponent
} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {LevelSpawner} from "db://assets/scripts/level/level_spawner";
import {Floor} from "db://assets/scripts/entities/floor";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import super_html_script from "db://assets/plugins/playable-foundation/super-html/super_html_script";
import {game_controller} from "db://assets/scripts/game_controller";
import {InputManager} from "db://assets/scripts/level/input_manager";

const {ccclass, property} = _decorator;

@ccclass('LevelManager')
export class LevelManager extends LifecycleComponent {
    @property({type: JsonAsset})
    levelJson: JsonAsset | null = null;

    private levelData: LevelData | null = null;

    private static _instance: LevelManager = new LevelManager();

    public static get instance(): LevelManager {
        return this._instance;
    }

    override onInitialize(): void {
        LevelManager._instance = this;
        this.loadLevelFromAsset(this.levelJson);
    }

    private loadLevelFromAsset(asset: JsonAsset | null) {
        if (!asset) {
            warn('[level_manager] No level JSON assigned in the editor.');
            return;
        }

        const parsed = LevelData.fromJsonAsset(asset);
        if (!parsed) {
            warn(`[level_manager] Failed to parse level data from ${asset.name}.`);
            return;
        }

        this.levelData = parsed;
    }

    getCurrentLevel(): LevelData | null {
        return this.levelData;
    }

    @property({type: LevelSpawner})
    levelSpawner: LevelSpawner | null = null;

    @property({type: InputManager})
    inputManager: InputManager | null = null;

    @property({type: game_controller})
    gameController: game_controller | null = null;

    public entitiesMaps: Map<string, IEntities[]> = new Map();
    public floors: Floor[] = [];
    
    override onStart(): void {
        this.entitiesMaps = this.levelSpawner.spawnLevel(this.levelData);
        this.floors = this.levelSpawner.floors;
        this.holeTotal = this.levelSpawner.holes.length;
    }

    private holeTotal: number = 0;
    private currentHoleComplete: number = 0;

    @property([Node])
    particles: Node[] = [];
    
    public checkLevelCompleted(){
        this.currentHoleComplete++;

        const isWin = this.currentHoleComplete >= this.holeTotal;

        if (isWin){
            this.particles[0].active = true;

            setTimeout(() => {
                this.particles[1].active = true;

            },  500);
        }

        setTimeout(() => {
            if (isWin){
                if(this.gameController){
                    this.gameController.loadScene();
                } else {
                    super_html_script.on_click_game_end();
                    super_html_script.on_click_download();
                }
            }
        }, 1800);
    }

    @property({type: Node})
    cti: Node | null = null;

    public endGame(){
        this.inputManager.isLockInput = true;
        this.cti.active = true;
    }
}
