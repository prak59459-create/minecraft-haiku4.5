import { BLOCKS } from './blocks.js';

export class CraftingSystem {
    constructor() {
        this.recipes = new Map();
        this.inventory = new Map();
        this.initializeRecipes();
    }

    initializeRecipes() {
        this.recipes.set('sticks', {
            inputs: [{ block: BLOCKS.OAK_LOG, count: 1 }],
            outputs: [{ block: BLOCKS.OAK_LOG, count: 4 }],
            category: 'woodworking'
        });

        this.recipes.set('planks', {
            inputs: [{ block: BLOCKS.OAK_LOG, count: 1 }],
            outputs: [{ block: BLOCKS.OAK_LOG, count: 4 }],
            category: 'woodworking'
        });

        this.recipes.set('sticks_from_planks', {
            inputs: [{ block: BLOCKS.OAK_LOG, count: 1 }],
            outputs: [{ block: BLOCKS.OAK_LOG, count: 2 }],
            category: 'woodworking'
        });
    }

    addToInventory(blockId, count = 1) {
        if (!this.inventory.has(blockId)) {
            this.inventory.set(blockId, 0);
        }
        this.inventory.set(blockId, this.inventory.get(blockId) + count);
    }

    removeFromInventory(blockId, count = 1) {
        if (!this.inventory.has(blockId)) return false;

        const current = this.inventory.get(blockId);
        if (current < count) return false;

        this.inventory.set(blockId, current - count);
        if (this.inventory.get(blockId) === 0) {
            this.inventory.delete(blockId);
        }
        return true;
    }

    getInventoryCount(blockId) {
        return this.inventory.get(blockId) || 0;
    }

    canCraft(recipeName) {
        const recipe = this.recipes.get(recipeName);
        if (!recipe) return false;

        for (const input of recipe.inputs) {
            if (this.getInventoryCount(input.block) < input.count) {
                return false;
            }
        }
        return true;
    }

    craft(recipeName) {
        if (!this.canCraft(recipeName)) return false;

        const recipe = this.recipes.get(recipeName);

        for (const input of recipe.inputs) {
            this.removeFromInventory(input.block, input.count);
        }

        for (const output of recipe.outputs) {
            this.addToInventory(output.block, output.count);
        }

        return true;
    }

    getRecipesByCategory(category) {
        const recipes = [];
        for (const [name, recipe] of this.recipes) {
            if (recipe.category === category) {
                recipes.push({ name, ...recipe });
            }
        }
        return recipes;
    }

    getAllRecipes() {
        const recipes = [];
        for (const [name, recipe] of this.recipes) {
            recipes.push({ name, ...recipe });
        }
        return recipes;
    }

    getInventoryState() {
        const state = {};
        for (const [blockId, count] of this.inventory) {
            state[blockId] = count;
        }
        return state;
    }

    loadInventoryState(state) {
        this.inventory.clear();
        for (const [blockId, count] of Object.entries(state)) {
            if (count > 0) {
                this.inventory.set(parseInt(blockId), count);
            }
        }
    }
}
