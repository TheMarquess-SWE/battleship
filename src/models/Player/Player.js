import Gameboard from '../Gameboard/Gameboard.js';

export default class Player {
  constructor(name, gameboardSize = 10, numberOfShips = 5, salvoMode = false) {
    this.name = name;
    this.gameboard = new Gameboard(gameboardSize, numberOfShips);
    this.normalMode = !salvoMode;
    this.salvoMode = salvoMode;
    this.attacksQueue = [];
  }

  placeShips(positionsSet) {
    positionsSet.forEach((position, shipIndex) => {
      this.placeShip(shipIndex, position);
    });
  }

  getRoundTargetsLeft() {
    return this.getAttacksLeft() - this.attacksQueue.length;
  }

  placeShip(shipIndex, positions) {
    return this.gameboard.placeShip(shipIndex, positions);
  }

  placeShipsRandomly() {
    this.gameboard.placeAllShipsRandomly();
  }

  receiveAttacks(attackedPositions) {
    attackedPositions.forEach((position) => {
      this.gameboard.receiveAttack(position);
    });
  }

  isValidAttack(position) {
    return this.gameboard.isValidAttack(position);
  }

  getAttacksLeft() {
    return this.salvoMode ? this.shipsAlive() : 1;
  }

  shipsAlive() {
    return this.gameboard.shipsAlive();
  }

  allShipsSunk() {
    return this.gameboard.allShipsSunk();
  }

  gameboardStatus() {
    return this.gameboard.allCellsStatus();
  }

  enqueueAttack(position) {
    this.attacksQueue.push(position);
  }

  clearAttacksQueue() {
    this.attacksQueue = [];
  }
}
