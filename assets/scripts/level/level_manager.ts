import {_decorator, JsonAsset, warn} from 'cc';
import {LevelData} from './level_data';
import {
    LifecycleComponent,
    register_lifecycle
} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {LevelSpawner} from "db://assets/scripts/level/level_spawner";
import {Floor} from "db://assets/scripts/entities/floor";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";

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
        console.log(parsed);
    }

    getCurrentLevel(): LevelData | null {
        return this.levelData;
    }

    @property({type: LevelSpawner})
    levelSpawner: LevelSpawner | null = null;

    public entitiesMaps: Map<string, IEntities[]> = new Map();
    public floors: Floor[] = [];
    
    override onStart(): void {
        this.entitiesMaps = this.levelSpawner.spawnLevel(this.levelData);
        this.floors = this.levelSpawner.floors;
    }

    public getFloors() : Floor[] {
        return this.levelSpawner.floors;
    }
}
