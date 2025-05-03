# Simon Says Game

This is a simple implementation of the classic Simon Says memory game, where the player must repeat a randomly generated sequence of colors and sounds.

## How to Play

- The game starts with a short sequence.
- The colored buttons light up in a random order, and the player must repeat the sequence by pressing the corresponding buttons.
- If the player repeats the sequence correctly, the game will add another color to the sequence.
- The game continues until the player makes a mistake, at which point the game ends.

## Working with the code

You'll need the following dependencies:
- [Node.js](https://nodejs.org/en) (perhaps use [nvm](https://github.com/nvm-sh/nvm) to manage your Node.js installation)
- [Gjs](https://gjs.guide/guides/gtk/3/03-installing.html#installing-gjs)
- A Linux environment

Clone the repository:
```
git clone https://github.com/devklick/simon-says.git
cd simon-says
```

Install dependencies and run the project:
```
npm install
npm start
```

## Future Enhancements
- Build and release (flatpak?)
- Add difficulty levels (e.g., slow, medium, fast).
- Improve visuals
- Add game over screen with player statistics (score, highest score etc).
