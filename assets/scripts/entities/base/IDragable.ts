import {Vec3} from 'cc';

export interface IDragable {
    beginDrag(hitPos: Vec3): void;

    drag(touchPos: Vec3): void;

    endDrag(): void;
}