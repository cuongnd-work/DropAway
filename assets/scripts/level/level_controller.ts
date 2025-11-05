import { _decorator, Component, Node, Prefab, Vec2, Vec3, warn } from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
import {LevelManager} from "db://assets/scripts/level/level_manager";

const { ccclass, property } = _decorator;

@ccclass('LevelController')
export class LevelController extends LifecycleComponent {
    @property({ type: LevelManager })
    levelManager: LevelManager | null = null;

    @property({ type: Prefab })
    floorPrefab: Prefab | null = null;
    
    @property({ type: Prefab })
    obstaclePrefab: Prefab | null = null;

    @property({ type: Node })
    entitiesRoot: Node | null = null;
    
}
