export class UndoRedoManager<T> {
    private history: T[];
    private cursor: number;
  
    constructor(private readonly maxLength: number) {
      this.history = [];
      this.cursor = -1;
    }
  
    get canUndo(): boolean {
      return this.cursor > 0;
    }
  
    get canRedo(): boolean {
      return this.cursor < this.history.length - 1;
    }
  
    addToHistory(item: T): void {
      // Remove items after the cursor if history is not at its end
      if (this.cursor < this.history.length - 1) {
        this.history.splice(this.cursor + 1);
      }
  
      // Add the new item to the history
      this.history.push(item);
  
      // If the history exceeds the maximum length, remove the oldest item
      if (this.history.length > this.maxLength) {
        this.history.shift();
      }
  
      // Move the cursor to the last position
      this.cursor = this.history.length - 1;
    }
  
    undo(): T | undefined {
      if (this.canUndo) {
        this.cursor--;
        return this.history[this.cursor];
      }
  
      return undefined;
    }
  
    redo(): T | undefined {
      if (this.canRedo) {
        this.cursor++;
        return this.history[this.cursor];
      }
  
      return undefined;
    }
  }
  