import Player from '../../models/Player/Player.js';

export default class GameController {
  constructor(gameSetup) {
    const { gameboardSize, numberOfShips, playerOneName, playerTwoName } =
      gameSetup;
    const { difficulty, mode } = gameSetup.settings;

    this.salvoMode = difficulty === 'salvo';
    this.players = [
      new Player(playerOneName, gameboardSize, numberOfShips, this.salvoMode),
      new Player(playerTwoName, gameboardSize, numberOfShips, this.salvoMode),
    ];

    this.currentPlayerIndex = 0;
  }

  switchPlayerTurn() {
    this.currentPlayerIndex = this.currentPlayerIndex === 0 ? 1 : 0;
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getOponentPlayer() {
    return this.players[1 - this.currentPlayerIndex];
  }

  attack(positionsToAttack) {
    if (positionsToAttack.length !== this.getCurrentPlayer().getAttacksLeft())
      throw new Error('Limit of attacks exceeded');

    this.getOponentPlayer().receiveAttacks(positionsToAttack);
    this.switchPlayerTurn();
  }

  placePlayersShipsRandomly() {
    this.players[0].placeShipsRandomly();
    this.players[1].placeShipsRandomly();
  }

  getWinner() {
    if (this.players[0].allShipsSunk() || this.players[1].allShipsSunk()) {
      return this.players[0].allShipsSunk() ? this.players[1] : this.players[0];
    }
    return undefined;
  }
}
