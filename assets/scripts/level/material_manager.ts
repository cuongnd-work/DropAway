import { _decorator, Material } from 'cc';
import {LifecycleComponent} from "db://assets/plugins/playable-foundation/game-foundation/lifecycle_manager";
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

    private holeMaterialMap: Map<number, Material> = new Map();

    private peopleMaterialMap: Map<number, Material> = new Map();

    public getHoleMaterial(key: number): Material | null {
        if (this.holeMaterialMap.has(key)) {
            return this.holeMaterialMap.get(key)!;
        }
        if (this.holeMaterials.length === 0) {
            console.warn('No hole materials assigned');
            return null;
        }
        const randomIndex = Math.floor(Math.random() * this.holeMaterials.length);
        const mat = this.holeMaterials[randomIndex];
        this.holeMaterialMap.set(key, mat);
        return mat;
    }

    public getPeopleMaterial(key: number): Material | null {
        if (this.peopleMaterialMap.has(key)) {
            return this.peopleMaterialMap.get(key)!;
        }
        if (this.peopleMaterials.length === 0) {
            console.warn('No people materials assigned');
            return null;
        }
        const randomIndex = Math.floor(Math.random() * this.peopleMaterials.length);
        const mat = this.peopleMaterials[randomIndex];
        this.peopleMaterialMap.set(key, mat);
        return mat;
    }
}
