import Phaser from "phaser";
import {
  generateDungeon,
  loadDungeon,
  getDungeon,
  moveTo,
  saveDungeon,
} from "shared/dungeonState";

export default class DungeonScene extends Phaser.Scene {
  constructor() {
    super("dungeon");
  }

  create() {
    this.cameras.main.fadeIn(250);
    loadDungeon();
    const dungeon = getDungeon();
    if (!dungeon.rooms || dungeon.rooms.length === 0) {
      generateDungeon(5, 5);
      saveDungeon();
    }
    const { rooms, current } = getDungeon();
    const size = 64;
    const offsetX = 100;
    const offsetY = 100;

    rooms.forEach((r) => {
      const rect = this.add
        .rectangle(
          offsetX + r.x * size,
          offsetY + r.y * size,
          size - 4,
          size - 4,
          0x1f2230,
        )
        .setOrigin(0.5)
        .setInteractive();

      if (r.x === current.x && r.y === current.y) {
        rect.setFillStyle(0x50fa7b);
      } else if (
        r.visited ||
        Math.abs(r.x - current.x) + Math.abs(r.y - current.y) === 1
      ) {
        rect.setFillStyle(0x44475a);
      } else {
        rect.setFillStyle(0x1f2230).setAlpha(0.2);
      }
      rect.on("pointerdown", () => {
        moveTo(r.x, r.y);
        this.cameras.main.fadeOut(300);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          const { rooms } = getDungeon();
          const idx = rooms.findIndex(
            (room) => room.x === r.x && room.y === r.y,
          );
          const room = rooms[idx];
          switch (room.type) {
            case "combat":
              this.scene.launch("battle", { roomIndex: idx });
              this.scene.sleep();
              break;
            case "shop":
              this.scene.start("shop");
              break;
            case "event":
              this.scene.start("event");
              break;
            default:
              this.scene.restart();
          }
        });
      });
    });
  }
}
