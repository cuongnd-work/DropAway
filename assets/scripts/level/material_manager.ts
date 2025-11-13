import { _decorator, Material } from 'cc';
import { LifecycleComponent } from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
const { ccclass, property } = _decorator;

@ccclass('MaterialManager')
export class MaterialManager extends LifecycleComponent {

    private static _instance: MaterialManager = new MaterialManager();

    public static get instance(): MaterialManager {
        return this._instance;
    }

    override onInitialize(): void {
        MaterialManager._instance = this;
    }

    @property([Material])
    holeMaterials: Material[] = [];

    @property([Material])
    peopleMaterials: Material[] = [];

    private materialMap: Map<number, { hole: Material, people: Material }> = new Map();

    /**
     * Lấy vật liệu Hole theo key
     */
    public getHoleMaterial(key: number): Material | null {
        const entry = this.getMaterialEntry(key);
        return entry ? entry.hole : null;
    }

    /**
     * Lấy vật liệu People theo key
     */
    public getPeopleMaterial(key: number): Material | null {
        const entry = this.getMaterialEntry(key);
        return entry ? entry.people : null;
    }

    /**
     * Lấy entry vật liệu đồng bộ theo key
     */
    private getMaterialEntry(key: number): { hole: Material, people: Material } | null {
        if (this.materialMap.has(key)) {
            return this.materialMap.get(key)!;
        }

        if (this.holeMaterials.length === 0 || this.peopleMaterials.length === 0) {
            console.warn('No hole or people materials assigned');
            return null;
        }

        // Đồng bộ: key % length để không vượt quá mảng
        const index = key % Math.min(this.holeMaterials.length, this.peopleMaterials.length);

        const entry = {
            hole: this.holeMaterials[index],
            people: this.peopleMaterials[index]
        };
        this.materialMap.set(key, entry);
        return entry;
    }
}
