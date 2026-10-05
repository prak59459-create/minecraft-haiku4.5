import { BLOCKS } from './blocks.js';

export class WorldEditor {
    constructor(world) {
        this.world = world;
        this.mode = 'normal';
        this.brushSize = 1;
        this.selectedTool = 'place';
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 100;
    }

    setMode(mode) {
        this.mode = mode;
    }

    setBrushSize(size) {
        this.brushSize = Math.max(1, Math.min(10, size));
    }

    fillArea(x, y, z, blockId) {
        const previousState = [];

        for (let dx = -this.brushSize; dx <= this.brushSize; dx++) {
            for (let dy = -this.brushSize; dy <= this.brushSize; dy++) {
                for (let dz = -this.brushSize; dz <= this.brushSize; dz++) {
                    const bx = x + dx;
                    const by = y + dy;
                    const bz = z + dz;

                    const prevBlock = this.world.getBlock(bx, by, bz);
                    previousState.push({
                        x: bx, y: by, z: bz,
                        blockId: prevBlock
                    });

                    this.world.setBlock(bx, by, bz, blockId);
                }
            }
        }

        this.undoStack.push({
            type: 'fill',
            state: previousState
        });

        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }

        this.redoStack = [];
        return previousState;
    }

    flattenArea(x, z, targetHeight) {
        const previousState = [];

        for (let dx = -this.brushSize; dx <= this.brushSize; dx++) {
            for (let dz = -this.brushSize; dz <= this.brushSize; dz++) {
                const bx = x + dx;
                const bz = z + dz;

                for (let by = 0; by < 256; by++) {
                    const prevBlock = this.world.getBlock(bx, by, bz);
                    if (prevBlock !== 0) {
                        previousState.push({
                            x: bx, y: by, z: bz,
                            blockId: prevBlock
                        });
                    }

                    const newBlockId = by < targetHeight ? BLOCKS.GRASS : BLOCKS.AIR;
                    this.world.setBlock(bx, by, bz, newBlockId);
                }
            }
        }

        this.undoStack.push({
            type: 'flatten',
            state: previousState
        });

        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }

        this.redoStack = [];
        return previousState;
    }

    raiseTerrain(x, z, amount) {
        const previousState = [];

        for (let dx = -this.brushSize; dx <= this.brushSize; dx++) {
            for (let dz = -this.brushSize; dz <= this.brushSize; dz++) {
                const bx = x + dx;
                const bz = z + dz;

                const maxY = 255;
                for (let by = Math.min(maxY - amount, maxY); by <= maxY; by++) {
                    const prevBlock = this.world.getBlock(bx, by - amount, bz);
                    const currentBlock = this.world.getBlock(bx, by, bz);

                    if (currentBlock !== 0) {
                        previousState.push({
                            x: bx, y: by, z: bz,
                            blockId: currentBlock
                        });
                    }

                    this.world.setBlock(bx, by, bz, prevBlock);
                }
            }
        }

        this.undoStack.push({
            type: 'raise',
            state: previousState
        });

        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }

        this.redoStack = [];
        return previousState;
    }

    lowerTerrain(x, z, amount) {
        const previousState = [];

        for (let dx = -this.brushSize; dx <= this.brushSize; dx++) {
            for (let dz = -this.brushSize; dz <= this.brushSize; dz++) {
                const bx = x + dx;
                const bz = z + dz;

                for (let by = amount; by < 256; by++) {
                    const prevBlock = this.world.getBlock(bx, by, bz);
                    const blockAbove = this.world.getBlock(bx, by + amount, bz);

                    if (prevBlock !== 0) {
                        previousState.push({
                            x: bx, y: by, z: bz,
                            blockId: prevBlock
                        });
                    }

                    this.world.setBlock(bx, by, bz, blockAbove);
                }

                for (let by = 256 - amount; by < 256; by++) {
                    const prevBlock = this.world.getBlock(bx, by, bz);
                    if (prevBlock !== 0) {
                        previousState.push({
                            x: bx, y: by, z: bz,
                            blockId: prevBlock
                        });
                    }
                    this.world.setBlock(bx, by, bz, BLOCKS.AIR);
                }
            }
        }

        this.undoStack.push({
            type: 'lower',
            state: previousState
        });

        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }

        this.redoStack = [];
        return previousState;
    }

    undo() {
        if (this.undoStack.length === 0) return false;

        const action = this.undoStack.pop();
        const redoState = [];

        for (const block of action.state) {
            const currentBlock = this.world.getBlock(block.x, block.y, block.z);
            redoState.push({
                x: block.x, y: block.y, z: block.z,
                blockId: currentBlock
            });

            this.world.setBlock(block.x, block.y, block.z, block.blockId);
        }

        this.redoStack.push({
            type: action.type,
            state: redoState
        });

        return true;
    }

    redo() {
        if (this.redoStack.length === 0) return false;

        const action = this.redoStack.pop();
        const undoState = [];

        for (const block of action.state) {
            const currentBlock = this.world.getBlock(block.x, block.y, block.z);
            undoState.push({
                x: block.x, y: block.y, z: block.z,
                blockId: currentBlock
            });

            this.world.setBlock(block.x, block.y, block.z, block.blockId);
        }

        this.undoStack.push({
            type: action.type,
            state: undoState
        });

        return true;
    }

    canUndo() {
        return this.undoStack.length > 0;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }

    clearHistory() {
        this.undoStack = [];
        this.redoStack = [];
    }
}
