import {JsonAsset, Vec2, Vec3} from 'cc';

export interface HoleData {
    position: Vec2;
    colorIndex: number;
    innerColorIndex: number;
    id: number;
    rotation: number;
    axisLockType: number;
    connectedId: number;
    maxPeopleHold: number;
}

export interface PersonData {
    position: Vec2;
    colorIndex: number;
}

export interface ElevatorData {
    position: Vec2;
    offsetPosition: Vec3;
    people: PersonData[];
}

export interface RawLevelData {
    LevelSize: Vec2;
    LevelDuration: number;
    HoleDataArray?: RawHoleData[];
    PeopleDataArray?: RawPersonData[];
    ElevatorDataArray?: RawElevatorData[];
    ObstaclePositions?: Vec2[];
    CameraSize?: number;
}

interface RawHoleData {
    GridPosition: Vec2;
    ColorIndex: number;
    InnerColorIndex?: number;
    Id?: number;
    Rotation?: number;
    AxisLockType?: number;
    ConnectedId?: number;
    MaxPeopleHold?: number;
}

interface RawPersonData {
    GridPosition: Vec2;
    ColorIndex: number;
}

interface RawElevatorData {
    GridPosition: Vec2;
    OffsetPosition?: Vec3;
    PeopleArray?: RawPersonData[];
}

/**
 * Normalised runtime representation of level JSON authored in the editor.
 */
export class LevelData {
    readonly levelSize: Vec2;
    readonly levelDuration: number;
    readonly holeData: HoleData[];
    readonly peopleData: PersonData[];
    readonly elevatorData: ElevatorData[];
    readonly obstaclePositions: Vec2[];
    readonly cameraSize: number;

    private constructor(raw: RawLevelData) {
        this.levelSize = raw.LevelSize;
        this.levelDuration = typeof raw.LevelDuration === 'number' ? raw.LevelDuration : 0;
        this.holeData = (raw.HoleDataArray ?? []).map(LevelData.mapHoleData);
        this.peopleData = (raw.PeopleDataArray ?? []).map(LevelData.mapPersonData);
        this.elevatorData = (raw.ElevatorDataArray ?? []).map(LevelData.mapElevatorData);
        this.obstaclePositions = (raw.ObstaclePositions ?? []).map(r => r);
        this.cameraSize = typeof raw.CameraSize === 'number' ? raw.CameraSize : 0;
    }

    static fromJsonAsset(asset: JsonAsset | null | undefined): LevelData | null {
        if (!asset || !asset.json) {
            return null;
        }

        return LevelData.fromUnknown(asset.json);
    }

    static fromUnknown(payload: unknown): LevelData | null {
        if (!payload || typeof payload !== 'object') {
            return null;
        }

        const raw = payload as RawLevelData;
        if (!raw.LevelSize || typeof raw.LevelSize.x !== 'number' || typeof raw.LevelSize.y !== 'number') {
            return null;
        }

        return new LevelData(raw);
    }

    /**
     * Builds a short log-friendly summary for quick inspection.
     */
    describe(): string {
        const holeCount = this.holeData.length;
        const peopleCount = this.peopleData.length;
        const elevatorCount = this.elevatorData.length;
        const elevatorPeople = this.countElevatorPeople();
        const obstacleCount = this.obstaclePositions.length;
        const colorSummary = this.createColorSummary();

        return `[LevelData] Size ${this.levelSize.x}x${this.levelSize.y}, duration ${this.levelDuration}s, camera ${this.cameraSize}, holes ${holeCount}, people ${peopleCount}, elevators ${elevatorCount} (people ${elevatorPeople}), obstacles ${obstacleCount}${colorSummary}`;
    }


    private static mapHoleData(raw: RawHoleData): HoleData {
        return {
            position: raw.GridPosition,
            colorIndex: raw.ColorIndex ?? 0,
            innerColorIndex: raw.InnerColorIndex ?? -1,
            id: raw.Id ?? 0,
            rotation: raw.Rotation ?? 0,
            axisLockType: raw.AxisLockType ?? 0,
            connectedId: raw.ConnectedId ?? 0,
            maxPeopleHold: raw.MaxPeopleHold ?? 0
        };
    }

    private static mapPersonData(raw: RawPersonData): PersonData {
        return {
            position: raw.GridPosition,
            colorIndex: raw.ColorIndex ?? 0
        };
    }

    private static mapElevatorData(raw: RawElevatorData): ElevatorData {
        return {
            position: raw.GridPosition,
            offsetPosition: raw.OffsetPosition,
            people: (raw.PeopleArray ?? []).map(LevelData.mapPersonData)
        };
    }

    private createColorSummary(): string {
        const counts: Record<number, { holes: number; people: number }> = {};

        for (const hole of this.holeData) {
            const bucket = counts[hole.colorIndex] ?? {holes: 0, people: 0};
            bucket.holes += 1;
            counts[hole.colorIndex] = bucket;
        }

        for (const person of this.peopleData) {
            const bucket = counts[person.colorIndex] ?? {holes: 0, people: 0};
            bucket.people += 1;
            counts[person.colorIndex] = bucket;
        }

        for (const elevator of this.elevatorData) {
            for (const person of elevator.people) {
                const bucket = counts[person.colorIndex] ?? {holes: 0, people: 0};
                bucket.people += 1;
                counts[person.colorIndex] = bucket;
            }
        }

        const fragments = Object.keys(counts)
            .map((key) => Number(key))
            .sort((a, b) => a - b)
            .map((colorIndex) => {
                const entry = counts[colorIndex];
                return ` | color ${colorIndex}: holes ${entry.holes}, people ${entry.people}`;
            });

        return fragments.join('');
    }

    private countElevatorPeople(): number {
        return this.elevatorData.reduce((total, elevator) => total + elevator.people.length, 0);
    }
}
