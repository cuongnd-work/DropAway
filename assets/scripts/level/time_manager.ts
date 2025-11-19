import {_decorator, Component, Label, Sprite, Color, Tween, Node} from 'cc';
import super_html_script from "db://assets/plugins/playable-foundation/super-html/super_html_script";
import {LevelManager} from "db://assets/scripts/level/level_manager";
import {AudioService} from "db://assets/plugins/playable-foundation/game-foundation/audio_manager/AudioService";
import {game_controller} from "db://assets/scripts/game_controller";

const { ccclass, property } = _decorator;

@ccclass('time_manager')
export class time_manager extends Component {

    @property
    maxTime: number = 60;

    @property(Label)
    timeLabel: Label = null!;

    @property(Node)
    isLose: Node = null!;

    @property(game_controller)
    game_controller: game_controller = null!;

    private _currentTime: number = 0;
    private _isRunning: boolean = false;

    private isWarning: boolean = false;

    @property(Sprite)
    private sprite!: Sprite;
    private originalColor!: Color;

    private tween: Tween;
    private labelTween: Tween;

    private lastTickTime: number = -1;     // ← Tick-Tack controller

    start() {
        this.reset();
        this.startTimer();

        if (this.sprite) this.originalColor = this.sprite.color.clone();
    }

    update(deltaTime: number) {
        if (!this._isRunning) return;

        this._currentTime -= deltaTime;

        if (this._currentTime < 0) {
            this._currentTime = 0;
            this._isRunning = false;

            this.tween?.stop();
            this.labelTween?.stop();

            setTimeout(() => {
                if (this.isLose) this.isLose.active = true;
                AudioService.instance.playSfx('GameFail');
            }, 200);

            setTimeout(() => {
                this.game_controller.loadScene();
            }, 2000);
        }

        if (this._currentTime <= 10 && !this.isWarning) {
            this.isWarning = true;
            if (this.sprite) this.playFadeLoop();
            this.playLabelBlink();
        }

        if (this._currentTime <= 10) {
            const sec = Math.ceil(this._currentTime);

            if (sec !== this.lastTickTime) {
                this.lastTickTime = sec;
                AudioService.instance.playSfx(this.lastTickTime ? 'Tick' : 'Tak');
            }
        }

        this.updateLabel();
    }

    startTimer() { this._isRunning = true; }
    pauseTimer() { this._isRunning = false; }

    reset() {
        this._currentTime = this.maxTime;
        this.lastTickTime = -1;
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

    getCurrentTime() { return this._currentTime; }

    playFadeLoop() {
        const startColor = this.originalColor.clone();
        const midColor = this.originalColor.clone();

        startColor.a = 0;
        midColor.a = 150;

        this.sprite.color = startColor;

        this.tween = new Tween(this.sprite)
            .to(0.5, { color: midColor })
            .to(0.5, { color: startColor })
            .union()
            .repeatForever()
            .start();
    }

    // Text đỏ ↔ trắng
    playLabelBlink() {
        const white = new Color(255, 255, 255, 255);
        const red = new Color(255, 0, 0, 255);

        this.labelTween = new Tween(this.timeLabel)
            .to(0.3, { color: red })
            .to(0.3, { color: white })
            .union()
            .repeatForever()
            .start();
    }
}
