import { _decorator, Component, JsonAsset, log, warn } from 'cc';
import { LevelData } from './level_data';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";

const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager extends LifecycleComponent {
    @property({ type: JsonAsset })
    levelJson: JsonAsset | null = null;

    private levelData: LevelData | null = null;

    override onInitialize(): void {
        this.loadLevelFromAsset(this.levelJson);
    }

    /**
     * Parses the referenced JSON file and logs a concise summary for debugging.
     */
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
        log(parsed.describe());
        console.log(parsed);
    }

    getCurrentLevel(): LevelData | null {
        return this.levelData;
    }
}
