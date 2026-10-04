window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    updateBlockSelector();
    console.log('Minecraft Clone loaded successfully!');
    console.log('Controls: WASD (move), Mouse (look), Space (jump), Shift (sprint), Left-click (break), Right-click (place), 1-9 (block select), Scroll (cycle blocks)');
});

window.addEventListener('beforeunload', () => {
    if (game && game.renderer) {
        game.renderer.renderer.dispose();
    }
});
