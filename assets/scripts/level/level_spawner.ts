import {_decorator, Node, Prefab, Vec2, Vec3, warn, Component} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {LevelManager} from "db://assets/scripts/level/level_manager";
import {LevelData} from "db://assets/scripts/level/level_data";
import {Floor} from "db://assets/scripts/entities/floor";
import {object_pool_manager} from "db://assets/plugins/playable-foundation/game-foundation/object_pool";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {Obstacle} from "db://assets/scripts/entities/obstacle";

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

    private entitiesMaps: Map<string, IEntities[]> = new Map();
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

        const parentNode = this.entitiesRoot ?? this.node;
        const halfWidth = (width - 1) * 0.5;
        const halfHeight = (height - 1) * 0.5;

        const obstacleSet = new Set<string>(
            levelData.obstaclePositions.map(v => `${v.x},${v.y}`)
        );

        const spawnEntity = <T extends Component & IEntities>(
            prefab: Prefab,
            pos3D: Vec3,
            pos2D: Vec2,
            parent: Node
        ): T | null => {
            const node = object_pool_manager.instance.Spawn(prefab, pos3D, null, parent);
            if (!node) return null;
            const comp = node.getComponent<T>(Component as any);
            if (!comp) {
                warn(`[LevelSpawner] Failed to get component for prefab at (${pos2D.x}, ${pos2D.y})`);
                return null;
            }
            (comp as any).position = pos2D;
            return comp;
        };

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const key = `${x},${y}`;
                const gridPos = new Vec2(x, y);
                const worldPos = new Vec3(x - halfWidth, 0, y - halfHeight);

                if (obstacleSet.has(key)) {
                    continue;
                }

                const floor = spawnEntity<Floor>(this.floorPrefab, worldPos, gridPos, parentNode);
                if (!floor) continue;

                this.floors.push(floor);
                this.addEntityToMap(key, floor);
            }
        }

        const floorKeys = new Set(this.floors.map(f => `${f.position.x},${f.position.y}`));

        for (const floor of this.floors) {
            const x = floor.position.x;
            const y = floor.position.y;

            const neighbors = [
                [x - 1, y],
                [x + 1, y],
                [x, y - 1],
                [x, y + 1]
            ];

            const isEdge = neighbors.some(([nx, ny]) => !floorKeys.has(`${nx},${ny}`));
            const key = `${x},${y}`;

            if (isEdge && this.obstaclePrefab) {
                const worldPos = new Vec3(x - halfWidth, 0, y - halfHeight);

                const obstacle = spawnEntity<Obstacle>(this.obstaclePrefab, worldPos, new Vec2(x, y), parentNode);
                if (obstacle) {
                    this.addEntityToMap(key, obstacle);
                }
            }
        }
    }

    private addEntityToMap(key: string, entity: IEntities): void {
        if (!this.entitiesMaps.has(key)) {
            this.entitiesMaps.set(key, []);
        }
        this.entitiesMaps.get(key)!.push(entity);
    }

    public makeKey(v: Vec2): string {
        return `${v.x},${v.y}`;
    }

    public static vec2Equal(a: Vec2, b: Vec2): boolean {
        return a.x === b.x && a.y === b.y;
    }
}
