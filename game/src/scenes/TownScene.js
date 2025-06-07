import Phaser from "phaser";
import { loadGameState, saveGameState } from "../state";
import { generateDungeon } from "shared/dungeonState";

export default class TownScene extends Phaser.Scene {
  constructor() {
    super("town");
  }

  create() {
    this.add
      .text(400, 300, "Town: press SPACE to enter dungeon", {
        fontSize: "20px",
      })
      .setOrigin(0.5);

    this.input.keyboard.once("keydown-SPACE", () => {
      generateDungeon(5, 5);
      const state = loadGameState();
      state.location = "dungeon";
      saveGameState(state);
      this.scene.start("dungeon");
    });
  }
}
