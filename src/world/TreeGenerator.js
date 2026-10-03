import { BlockType } from './BlockType.js';

export class TreeGenerator {
    static generateTree(chunkManager, x, y, z) {
        if (y >= 62 || y < 5) return;

        const height = 4 + Math.floor(Math.random() * 4);
        const foliageRadius = 2;

        // Trunk
        for (let dy = 0; dy < height; dy++) {
            const block = chunkManager.getBlock(x, y + dy, z);
            if (block === 0 || block === BlockType.LEAVES) {
                chunkManager.setBlock(x, y + dy, z, BlockType.WOOD);
            }
        }

        // Foliage
        const foliageStartHeight = height - 2;
        for (let dy = foliageStartHeight; dy < height + 2; dy++) {
            const radiusAtHeight = dy === foliageStartHeight + 2 ? 1 : foliageRadius;

            for (let dx = -radiusAtHeight; dx <= radiusAtHeight; dx++) {
                for (let dz = -radiusAtHeight; dz <= radiusAtHeight; dz++) {
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist <= radiusAtHeight + 0.5) {
                        const blockToCheck = chunkManager.getBlock(x + dx, y + dy, z + dz);
                        if (blockToCheck === 0 || blockToCheck === BlockType.LEAVES) {
                            chunkManager.setBlock(x + dx, y + dy, z + dz, BlockType.LEAVES);
                        }
                    }
                }
            }
        }
    }

    static shouldGenerateTree(x, z) {
        const rand = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
        return rand < 0.15;
    }
}
