import Phaser from 'phaser';
import * as Assets from './assets.ts';

class GameScene extends Phaser.Scene {
  constructor() {
    super('gameScene');
  }

  ball!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  paddle!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  blocks!: Phaser.Physics.Arcade.StaticGroup;

  preload() {
    this.load.image(Assets.ball_name, Assets.ball);
    this.load.image(Assets.block_name, Assets.block);
    this.load.image(Assets.board_name, Assets.board);
  }

  create() {
    this.createBlocks();

    this.paddle = this.physics.add.image(200, 550, Assets.board_name).setImmovable(true);
    this.paddle.body.allowGravity = false;

    // ボールを作成
    this.ball = this.physics.add.image(200, 500, Assets.ball_name);
    this.ball.setCollideWorldBounds(true); // 画面の端で跳ね返る
    this.ball.setBounce(1);                // ボールが壁やパドルに当たると反射する
    this.ball.setVelocity(0, 200);       // ボールに初期速度を与える

    // パドルとボールの衝突処理
    this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, undefined, this);

    // ボールとブロックの衝突処理
    this.physics.add.collider(this.ball, this.blocks, this.hitBlock, undefined, this);

    // 壁との衝突
    this.physics.world.setBoundsCollision(true, true, true, false); // 下方向の衝突を無効にする
  }

  update() {
    // パドルの操作（左右移動）
    this.paddle.x = this.input.x;

    // ボールが画面の下端に落ちたときの処理
    if (this.ball.y > 600) {
      this.resetBall();
    }
  }

  private createBlocks() {
    // ブロックの設定
    const blockWidth = 64;  // 1つのブロックの幅
    const blockHeight = 32; // 1つのブロックの高さ
    const cols = 5;        // ブロックの列数
    const rows = 5;         // ブロックの行数
    const offsetX = 40 + 32;    // 左側の余白
    const offsetY = 50;     // 上側の余白
    const spacing = 0;     // ブロック間のスペース

    this.blocks = this.physics.add.staticGroup();

    // ブロックを生成するループ
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * (blockWidth + spacing);
        const y = offsetY + row * (blockHeight + spacing);
        this.blocks
          .create(x, y, Assets.block_name)
          .setTint(this.getRandomInt(0x444444, 0xFFFFFF));
      }
    }
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private hitPaddle(
    ball: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Tilemaps.Tile,
    paddle: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Tilemaps.Tile
  ): void {
    const b = ball as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    const p = paddle as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

    // パドルに当たったときのボールの反射角度を調整
    let diff = 0;

    if (b.x < p.x) {
      // ボールがパドルの左側に当たった
      diff = p.x - b.x;
      b.setVelocityX(-10 * diff);
    } else if (b.x > p.x) {
      // ボールがパドルの右側に当たった
      diff = b.x - p.x;
      b.setVelocityX(10 * diff);
    }
  }

  private resetBall(): void {
    this.ball.setPosition(200, 500);
    this.ball.setVelocity(0, 200);
 }

  private hitBlock(
    _ball: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Tilemaps.Tile,
    block: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Tilemaps.Tile
  ): void {
    block.destroy();
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 400,
  height: 600,
  parent: 'app',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    },
  },
  scene: GameScene,
};

new Phaser.Game(config);
