import { DefaultModifierStack } from "./defaults/modifiers";
import { changeModifier } from "./modifierStack";
import { UndoRedoManager } from "./undoRedoManager";
import { debounce } from "./utils";

export class ChromicApi {
  public modifierStack: ModifierStack = [];
  private undoRedoManager: UndoRedoManager<ModifierStack> = new UndoRedoManager(
    1000
  );
  addToHistory: (state: ModifierStack) => void;

  constructor() {
    this.addToHistory = debounce(this.undoRedoManager.addToHistory, 300);
  }

  run(command: string) {
    const stateBackup = this.modifierStack.slice();

    try {
      const cmdArr = command.split(" ");
      const action = cmdArr.splice(0, 1)[0].toLowerCase();

      switch (action) {
        case "add":
          const name = cmdArr.splice(0, 1)[0];
          const defaultModifierStack = JSON.parse(
            JSON.stringify(DefaultModifierStack)
          );

          for (let i = 0; i < defaultModifierStack.length; i++) {
            const el = defaultModifierStack[i];
            if (el.name.toLowerCase() !== name.toLowerCase()) continue;
            el.id = crypto.randomUUID;
            this.modifierStack.push(el);
            break;
          }
          return;

        case "delete": {
          const id = cmdArr.splice(0, 1)[0];

          for (let i = 0; i < this.modifierStack.length; i++) {
            if (this.modifierStack[i].id !== id) continue;
            this.modifierStack.splice(i, 1);
          }

          return;
        }

        case "update": {
          const id = cmdArr.splice(0, 1)[0];
          const key = cmdArr.splice(0, 1)[0];
          const value = JSON.parse(cmdArr.join(" "));

          changeModifier(this.modifierStack, id, key, value);
          return;
        }

        case "replace": {
          this.modifierStack = JSON.parse(cmdArr.join(" "));
          return;
        }

        case "switch": {
          const idx1 = +cmdArr[0];
          const idx2 = +cmdArr[1];

          const tmp = this.modifierStack[idx2];
          this.modifierStack[idx2] = this.modifierStack[idx1];
          this.modifierStack[idx1] = tmp;

          return;
        }

        case "undo": {
          this.modifierStack =
            this.undoRedoManager.undo() || this.modifierStack;

          return;
        }

        case "redo": {
          this.modifierStack =
            this.undoRedoManager.redo() || this.modifierStack;

          return;
        }
      }
    } catch (err) {
      console.error(err);
      return;
    }

    this.addToHistory(stateBackup);
  }
}
