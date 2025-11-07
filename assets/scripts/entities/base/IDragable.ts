import {Vec3} from 'cc';

export interface IDragable {
    beginDrag(): void;

    drag(touchPos: Vec3): void;

    endDrag(): void;
}