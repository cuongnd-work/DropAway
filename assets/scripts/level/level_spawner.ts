import {_decorator, Component, Node, Prefab, Vec2, Vec3, warn} from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {LevelData} from "db://assets/scripts/level/level_data";
import {Floor} from "db://assets/scripts/entities/floor";
import {object_pool_manager} from "db://assets/plugins/playable-foundation/game-foundation/object_pool";
import {IEntities} from "db://assets/scripts/entities/base/IEntities";
import {Obstacle} from "db://assets/scripts/entities/obstacle";
import {Hole} from "db://assets/scripts/entities/hole";
import {People} from "db://assets/scripts/entities/people";
import {Elevator} from "db://assets/scripts/entities/elevator";

const {ccclass, property} = _decorator;

@ccclass('LevelSpawner')
export class LevelSpawner extends LifecycleComponent {
    @property({type: Prefab})
    floorPrefab: Prefab | null = null;

    @property({type: Prefab})
    holePrefab: Prefab | null = null;

    @property({type: Prefab})
    peoplePrefab: Prefab | null = null;

    @property({type: Prefab})
    elevatorPrefab: Prefab | null = null;

    @property({type: Prefab})
    obstaclePrefab: Prefab | null = null;

    @property({type: Node})
    entitiesRoot: Node | null = null;

    public floors: Floor[] = [];
    public holes: Hole[] = [];

    public spawnLevel(levelData: LevelData): Map<string, IEntities[]> {
        let entitiesMaps = new Map<string, IEntities[]>();
        
        if (!this.floorPrefab) {
            warn('[LevelSpawner] Floor prefab is not assigned.');
            return entitiesMaps;
        }

        const width = Math.max(0, Math.floor(levelData.levelSize.x));
        const height = Math.max(0, Math.floor(levelData.levelSize.y));

        if (width === 0 || height === 0) {
            warn(`[LevelSpawner] Invalid level size (${levelData.levelSize.x}x${levelData.levelSize.y}).`);
            return entitiesMaps;
        }

        const parentNode = this.entitiesRoot ?? this.node;
        const halfWidth = (width - 1) * 0.5;
        const halfHeight = (height - 1) * 0.5;

        const obstacleSet = new Set<string>(
            levelData.obstaclePositions.map(v => `${v.x},${v.y}`)
        );
        
        const holeSet = new Set<string>(
            levelData.holeData.map(v => `${v.position.x},${v.position.y}`)
        );

        const peopleSet = new Set<string>(
            levelData.peopleData.map(v => `${v.position.x},${v.position.y}`)
        );

        const elevatorSet = new Set<string>(
            levelData.elevatorData.map(v => `${v.position.x},${v.position.y}`)
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
                const worldPos = new Vec3(x - halfWidth, 0, -(y - halfHeight));

                if (obstacleSet.has(key)) {
                    continue;
                }

                if (holeSet.has(key)) {
                    const holeData = levelData.holeData.find(h => h.position.x === x && h.position.y === y);

                    if (holeData) {
                        const hole = spawnEntity<Hole>(this.holePrefab, worldPos, gridPos, parentNode);
                        if (hole) {
                            hole.bindData(holeData);

                            this.holes.push(hole);

                            if (!entitiesMaps.has(key)) {
                                entitiesMaps.set(key, []);
                            }
                            entitiesMaps.get(key)!.push(hole);
                        }
                    }
                }

                if (peopleSet.has(key)) {
                    const peopleData = levelData.peopleData.find(h => h.position.x === x && h.position.y === y);

                    if (peopleData) {
                        const people = spawnEntity<People>(this.peoplePrefab, worldPos, gridPos, parentNode);
                        if (people) {
                            people.bindData(peopleData, false);

                            if (!entitiesMaps.has(key)) {
                                entitiesMaps.set(key, []);
                            }
                            entitiesMaps.get(key)!.push(people);
                        }
                    }
                }

                if (elevatorSet.has(key)) {
                    const elevatorData = levelData.elevatorData.find(h => h.position.x === x && h.position.y === y);

                    if (elevatorData) {
                        const elevator = spawnEntity<Elevator>(this.elevatorPrefab, worldPos, gridPos, parentNode);
                        if (elevator) {
                            elevator.bindData(elevatorData, levelData.levelSize.x, levelData.levelSize.y);

                            if (!entitiesMaps.has(key)) {
                                entitiesMaps.set(key, []);
                            }
                            entitiesMaps.get(key)!.push(elevator);
                        }
                    }
                }
                
                const floor = spawnEntity<Floor>(this.floorPrefab, worldPos, gridPos, parentNode);
                if (!floor) continue;

                this.floors.push(floor);
                if (!entitiesMaps.has(key)) {
                    entitiesMaps.set(key, []);
                }
                entitiesMaps.get(key)!.push(floor);
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
                const localPos = new Vec3(x - halfWidth, 0, y - halfHeight);

                const obstacle = spawnEntity<Obstacle>(
                    this.obstaclePrefab,
                    localPos,
                    new Vec2(x, y),
                    parentNode
                );

                if (obstacle) {
                    if (!entitiesMaps.has(key)) {
                        entitiesMaps.set(key, []);
                    }
                    entitiesMaps.get(key)!.push(obstacle);

                    const neighborOffsets = [
                        [0, 1],  
                        [1, 0],   
                        [0, -1],  
                        [-1, 0]   
                    ];

                    const neighbors: IEntities[] = [];

                    for (const [dx, dy] of neighborOffsets) {
                        const neighborKey = `${x + dx},${y + dy}`;
                        if (entitiesMaps.has(neighborKey)) {
                            neighbors.push(...entitiesMaps.get(neighborKey)!);
                        }
                    }

                    obstacle.setupInit(neighbors);
                }
            }
        }
        return entitiesMaps;
    }
}
