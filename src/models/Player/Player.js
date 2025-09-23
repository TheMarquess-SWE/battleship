import Gameboard from '../Gameboard/Gameboard.js';

export default class Player {
  constructor(name) {
    this.name = name;
    this.gameboard = new Gameboard();
  }

  placeShips(positionsSet) {
    positionsSet.forEach((position, shipIndex) => {
      this.placeShip(shipIndex, position);
    });
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

  shipsAlive() {
    return this.gameboard.shipsAlive();
  }

  allShipsSunk() {
    return this.gameboard.allShipsSunk();
  }

  gameboardStatus() {
    return this.gameboard.allCellsStatus();
  }

  shipsPositions() {
    return this.gameboard.ships.positions;
  }
}
