import Phaser from 'phaser';

import LaneScene, { VIEW } from './scenes/LaneScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#07090d',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: VIEW.w,
    height: VIEW.h,
  },
  scene: [LaneScene],
});
