export class Inventory {
  constructor(slots = 36) {
    this.slots = new Array(slots).fill(null).map(() => ({ block: null, count: 0 }));
    this.selectedSlot = 0;
  }

  addBlock(blockType, count = 1) {
    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i].block === blockType) {
        this.slots[i].count += count;
        return true;
      }
    }

    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i].block === null) {
        this.slots[i].block = blockType;
        this.slots[i].count = count;
        return true;
      }
    }

    return false;
  }

  removeBlock(blockType, count = 1) {
    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i].block === blockType) {
        this.slots[i].count -= count;
        if (this.slots[i].count <= 0) {
          this.slots[i].block = null;
          this.slots[i].count = 0;
        }
        return true;
      }
    }
    return false;
  }

  getSelectedBlock() {
    const slot = this.slots[this.selectedSlot];
    return slot.block;
  }

  getBlockCount(blockType) {
    let total = 0;
    for (const slot of this.slots) {
      if (slot.block === blockType) {
        total += slot.count;
      }
    }
    return total;
  }

  selectSlot(index) {
    if (index >= 0 && index < this.slots.length) {
      this.selectedSlot = index;
      return true;
    }
    return false;
  }

  getSlots() {
    return this.slots;
  }

  getSelectedSlot() {
    return this.selectedSlot;
  }
}

export class CraftingRecipe {
  constructor(name, inputs, output, outputCount = 1) {
    this.name = name;
    this.inputs = inputs;
    this.output = output;
    this.outputCount = outputCount;
  }

  canCraft(inventory) {
    for (const input of this.inputs) {
      if (inventory.getBlockCount(input.block) < input.count) {
        return false;
      }
    }
    return true;
  }

  craft(inventory) {
    if (!this.canCraft(inventory)) return false;

    for (const input of this.inputs) {
      inventory.removeBlock(input.block, input.count);
    }

    inventory.addBlock(this.output, this.outputCount);
    return true;
  }
}

export class CraftingSystem {
  constructor() {
    this.recipes = [
      new CraftingRecipe('Planks', [{ block: 4, count: 1 }], 1, 4),
      new CraftingRecipe('Sticks', [{ block: 1, count: 2 }], 5, 4),
      new CraftingRecipe('Crafting Table', [{ block: 1, count: 4 }], 9, 1)
    ];
  }

  getRecipes() {
    return this.recipes;
  }

  getRecipeByName(name) {
    return this.recipes.find(r => r.name === name);
  }

  craftByName(name, inventory) {
    const recipe = this.getRecipeByName(name);
    return recipe ? recipe.craft(inventory) : false;
  }
}
