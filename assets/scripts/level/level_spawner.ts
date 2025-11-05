import {_decorator, Node, Prefab, Vec3, warn} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {LevelManager} from "db://assets/scripts/level/level_manager";
import {LevelData} from "db://assets/scripts/level/level_data";
import {Floor} from "db://assets/scripts/entities/floor";
import {object_pool_manager} from "db://assets/plugins/playable-foundation/game-foundation/object_pool";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";

const {ccclass, property} = _decorator;

@ccclass('LevelSpawner')
export class LevelSpawner extends LifecycleComponent {
    @property({type: LevelManager})
    levelManager: LevelManager | null = null;

    @property({type: Prefab})
    floorPrefab: Prefab | null = null;

    @property({type: Prefab})
    obstaclePrefab: Prefab | null = null;

    @property({type: Node})
    entitiesRoot: Node | null = null;

    override onInitialize(): void {
        // Reserved for future setup if needed.
    }

    override onStart(): void {
        if (!this.levelManager) {
            warn('[LevelSpawner] LevelManager is not assigned.');
            return;
        }

        const levelData = this.levelManager.getCurrentLevel();
        if (!levelData) {
            warn('[LevelSpawner] No level data available to spawn.');
            return;
        }

        this.spawnLevel(levelData);
    }

    private maps: (IEntities | null)[][] = [];
    private floors: Floor[] = [];

    private spawnLevel(levelData: LevelData): void {
        if (!this.floorPrefab) {
            warn('[LevelSpawner] Floor prefab is not assigned.');
            return;
        }

        const width = Math.max(0, Math.floor(levelData.levelSize.x));
        const height = Math.max(0, Math.floor(levelData.levelSize.y));

        if (width === 0 || height === 0) {
            warn(`[LevelSpawner] Invalid level size (${levelData.levelSize.x}x${levelData.levelSize.y}).`);
            return;
        }

        this.maps = Array.from({length: height}, () => Array<IEntities | null>(width).fill(null));
        const parentNode = this.entitiesRoot ?? this.node;
        const halfWidth = (width - 1) * 0.5;
        const halfHeight = (height - 1) * 0.5;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const position = new Vec3(x - halfWidth, 0, y - halfHeight);
                const node = object_pool_manager.instance.Spawn(this.floorPrefab, position, null, parentNode);
                let floor = node.getComponent(Floor);
                if (!floor) {
                    warn(`[LevelSpawner] Failed to spawn floor at grid (${x}, ${y}).`);
                    continue;
                }

                this.floors.push(floor);
                this.maps[y][x] = floor;
            }
        }
    }
}
