import {_decorator, Component, Label} from 'cc';
import super_html_script from "db://assets/plugins/playable-foundation/super-html/super_html_script";
import {LevelManager} from "db://assets/scripts/level/level_manager";

const { ccclass, property } = _decorator;

@ccclass('time_manager')
export class time_manager extends Component {

    @property
    maxTime: number = 60;

    @property(Label)
    timeLabel: Label = null!;

    private _currentTime: number = 0;
    private _isRunning: boolean = false;

    start() {
        this.reset();
        this.startTimer();
    }

    update(deltaTime: number) {
        if (!this._isRunning) return;

        this._currentTime -= deltaTime;

        if (this._currentTime < 0) {
            this._currentTime = 0;
            this._isRunning = false;

            setTimeout(() => {
                LevelManager.instance.endGame();
            }, 1000);
        }

        this.updateLabel();
    }

    startTimer() {
        this._isRunning = true;
    }

    pauseTimer() {
        this._isRunning = false;
    }

    reset() {
        this._currentTime = this.maxTime;
        this.updateLabel();
    }

    updateLabel() {
        if (!this.timeLabel) return;

        let total = Math.floor(this._currentTime);

        let minutes = Math.floor(total / 60);
        let seconds = total % 60;

        let text =
            (minutes < 10 ? "0" + minutes : minutes) +
            ":" +
            (seconds < 10 ? "0" + seconds : seconds);

        this.timeLabel.string = text;
    }

    getCurrentTime() {
        return this._currentTime;
    }
}
