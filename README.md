# Memory Game

A browser-based memory card game built with JavaScript.

The goal is to find all matching pairs of cards using as few attempts as possible. Each successful pair remains open, while unmatched cards are automatically closed after a short delay.

## Demo

The application is deployed on GitHub Pages:

**[Play Memory Game](https://github.com/AleksandraRog/memory-game/memory-game/)**

## Features

* 16 cards containing 8 matching pairs
* Random card arrangement for every new game
* Automatic closing of unmatched cards
* Cards are temporarily locked while a pair is being checked
* Hit counter showing the number of attempts
* Win counter showing the number of found pairs
* Win modal with the final score
* Leaders table with saved game results
* Game results are stored in the browser's `localStorage`
* New game can be started at any time

## How to Play

1. Click a card to reveal its image.
2. Click another card.
3. If the two cards match, they remain open.
4. If they do not match, both cards are automatically closed after a short delay.
5. Continue until all 8 pairs are found.
6. Your score is the number of attempts required to find all pairs.

The lower the score, the better the result.

## Local Development

If you want to run the project locally or modify the source code, clone the repository and install its dependencies.

### Requirements

* Node.js
* npm

### Setup

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### Start the Development Server

```bash
npm run dev
```

The development server will provide a local URL in the terminal.

### Production Build

```bash
npm run build
```

## Project Structure

The application separates the game logic, data handling, and UI rendering into dedicated modules.

* `Game.js` — game result entity
* `GameModel.js` — game state and game logic
* `LidersModel.js` — leaders/results logic
* `DataClient.js` — local data storage
* `ItemUI.js` — UI element creation
* `utils.js` — utility functions

The UI communicates with the game model through state changes and subscribed reducer functions.

## Data Storage

Game results are stored locally in the browser using `localStorage`.

Clearing the browser's site data will also remove the saved leaders table.

## Technologies

* JavaScript
* HTML
* CSS
* DOM API
* LocalStorage
* npm
* GitHub Pages
