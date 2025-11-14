import {_decorator, Component, Label, Sprite, Color, Tween, Node} from 'cc';
import super_html_script from "db://assets/plugins/playable-foundation/super-html/super_html_script";
import {LevelManager} from "db://assets/scripts/level/level_manager";

const { ccclass, property } = _decorator;

@ccclass('time_manager')
export class time_manager extends Component {
    @property
    maxTime: number = 60;

    @property(Label)
    timeLabel: Label = null!;

    @property(Node)
    lose: Node = null!;

    private _currentTime: number = 0;
    private _isRunning: boolean = false;

    start() {
        this.reset();
        this.startTimer();
        this.originalColor = this.sprite.color.clone();
    }

    private isWarning: boolean = false;

    update(deltaTime: number) {
        if (!this._isRunning) return;

        this._currentTime -= deltaTime;

        if (this._currentTime < 0) {
            this._currentTime = 0;
            this._isRunning = false;

            this.tween?.stop();

            setTimeout(() => {
                this.lose.active = true;
            }, 200);

            setTimeout(() => {
                LevelManager.instance.endGame();
            }, 1000);
        }
        if(this._currentTime <= 10 && !this.isWarning) {
            this.isWarning = true;
            this.playFadeLoop();
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


    @property(Sprite)
    private sprite!: Sprite;
    private originalColor!: Color;

    private tween: Tween;

    playFadeLoop() {
        const startColor = this.originalColor.clone();
        const midColor = this.originalColor.clone();
        const endColor = this.originalColor.clone();

        // alpha 0
        startColor.a = 0;
        // alpha 30
        midColor.a = 70;

        // Reset sprite về alpha 0 trước khi tween
        this.sprite.color = startColor;

        // Tween lặp vô hạn
        this.tween = new Tween(this.sprite)
            .to(0.5, { color: midColor })  // 0 → 30 alpha
            .to(0.5, { color: startColor }) // 30 → 0 alpha
            .union()
            .repeatForever()
            .start();
    }
}
