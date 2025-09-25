import Cell from '../Cell/Cell.js';
import Ship from '../Ship/Ship.js';

export default class Gameboard {
  constructor(size = 10, numberOfShips = 5) {
    this.rows = size;
    this.columns = this.rows;
    this.size = this.rows * this.columns;
    this.numberOfShips = numberOfShips;
    this.ships = this.populateFleet();
    this.board = new Array(this.size).fill(null).map((cell, index) => {
      const row = Math.floor(index / this.rows);
      const column = index % this.columns;
      return new Cell(index, row, column);
    });
  }

  getInfo() {
    return {
      rows: this.rows,
      columns: this.columns,
      ships: this.ships,
      board: this.board,
    };
  }

  populateFleet() {
    const ships = new Array(this.numberOfShips).fill(null);
    return ships.map((ship, index) => {
      const totalTypesOfShips = 5;
      const type = index % totalTypesOfShips;
      return new Ship(type);
    });
  }

  placeShip(shipIndex, positions) {
    const ship = this.ships[shipIndex];
    const validPositions = this.areValidPositionsForShip(positions, ship);
    if (!validPositions) return false;
    ship.positions = positions;
    positions.forEach((boardIndex, shipSection) => {
      const cell = this.board[boardIndex];
      cell.isOccupied = true;
      cell.shipIndex = shipIndex;
      cell.shipType = ship.type;
      cell.shipSection = shipSection;
    });
    return true;
  }

  areValidPositionsForShip(positions, ship) {
    const shipLength = ship.length;
    if (shipLength !== positions.length) return false;
    // check for repeated positions
    const noRepeatPositions = new Set(positions);
    if (noRepeatPositions.size !== shipLength) return false;
    // check all positions are in range and not occupied yet
    if (
      !positions.every(
        (position) =>
          position >= 0 &&
          position < this.board.length &&
          !this.board[position].isOccupied
      )
    )
      return false;

    // check horizontally
    const sameRow = positions.every(
      (position) =>
        Math.floor(position / this.rows) ===
        Math.floor(positions[0] / this.rows)
    );
    const horizontalContinuous =
      sameRow &&
      positions.every(
        (position, i) => i === 0 || position === positions[i - 1] + 1
      );

    // check vertically
    const sameColumn = positions.every(
      (position) => position % this.columns === positions[0] % this.columns
    );
    const verticalContinuous =
      sameColumn &&
      positions.every(
        (position, i) => i === 0 || position === positions[i - 1] + this.columns
      );

    return horizontalContinuous || verticalContinuous;
  }

  placeAllShipsRandomly() {
    this.ships.forEach((ship, shipIndex) => {
      if (!this.placeShipRandomly(shipIndex))
        throw new Error('FAILED TO PLACE SHIPS RANDOMLY');
    });
  }

  placeShipRandomly(shipIndex) {
    const ship = this.ships[shipIndex];
    const orientation = Math.round(Math.random());
    const horizontal = orientation === 0;
    const vertical = orientation === 1;
    let positions = [];
    if (horizontal) {
      positions = this.randomHorizontalPositions(ship);
    }
    if (vertical) {
      positions = this.randomVerticalPositions(ship);
    }
    return this.placeShip(shipIndex, positions);
  }

  randomHorizontalPositions(ship) {
    const shipLength = ship.length;
    let positions;

    do {
      const row = Math.floor(Math.random() * this.rows);
      const startColumnLimit = this.columns - shipLength;
      const startColumn = Math.floor(Math.random() * (startColumnLimit + 1));
      const startColumnIndex = this.findIndexRowColumn(row, startColumn);
      positions = new Array(shipLength)
        .fill(startColumnIndex)
        .map((columnIndex, i) => columnIndex + i);
    } while (!this.areValidPositionsForShip(positions, ship));

    return positions;
  }

  randomVerticalPositions(ship) {
    const shipLength = ship.length;
    let positions;

    do {
      const column = Math.floor(Math.random() * this.columns);
      const startRowLimit = this.rows - shipLength;
      const startRow = Math.floor(Math.random() * (startRowLimit + 1));
      const startRowIndex = this.findIndexRowColumn(startRow, column);
      positions = new Array(shipLength)
        .fill(startRowIndex)
        .map((rowIndex, i) => rowIndex + this.columns * i);
    } while (!this.areValidPositionsForShip(positions, ship));

    return positions;
  }

  findIndexRowColumn(row, column) {
    return row * this.columns + column;
  }

  receiveAttack(cellIndex) {
    if (!this.isValidAttack(cellIndex)) return false;

    const cell = this.board[cellIndex];
    const { status, shipIndex, shipSection, isOccupied } = cell;

    if (isOccupied) {
      const ship = this.ships[shipIndex];
      ship.hit(shipSection);
      cell.status = 2;
      if (ship.isSunk()) this.markShipSunk(shipIndex);
      return true;
    }
    cell.status = 1;
    return true;
  }

  isValidAttack(cellIndex) {
    if (cellIndex < 0 || cellIndex >= this.size) return false;
    const cell = this.board[cellIndex];
    if (cell.status !== 0) return false;
    return true;
  }

  markShipSunk(shipIndex) {
    const ship = this.ships[shipIndex];
    ship.positions.forEach((position) => {
      const cell = this.board[position];
      cell.status = 3;
    });
  }

  shipsAlive() {
    let counter = 0;
    this.ships.forEach((ship) => (counter += ship.isSunk() ? 0 : 1));
    return counter;
  }

  allShipsSunk() {
    return this.shipsAlive() === 0 ? true : false;
  }

  sinkShip(shipIndex) {
    const ship = this.ships[shipIndex];
    ship.positions.forEach((position) => this.receiveAttack(position));
  }

  sinkAllShips() {
    this.ships.forEach((ship, shipIndex) => this.sinkShip(shipIndex));
  }

  allCellsStatus() {
    return this.board.map((cell) => cell.status);
  }

  printBoard() {
    let index = 0;
    for (let row = 0; row < this.rows; row += 1) {
      let stringRowA = '';
      let stringRowB = '';
      let stringRowC = '';
      for (let cols = 0; cols < this.columns; cols += 1) {
        const { status, shipType, shipSection } = this.board[index];
        stringRowA += ` s:${status}  t:${shipType ?? 'n'} |`;
        if (row === 0) {
          stringRowB += ` i:${index}  S:${shipSection ?? 'n'} |`;
        } else {
          stringRowB += ` i:${index} S:${shipSection ?? 'n'} |`;
        }
        stringRowC += '-----------';
        index += 1;
      }
      console.log(stringRowA);
      console.log(stringRowB);
      console.log(stringRowC);
    }
  }

  printBoardHidingShips() {
    let index = 0;
    for (let row = 0; row < this.rows; row += 1) {
      let stringRow = '';
      for (let col = 0; col < this.columns; col += 1) {
        const cell = this.board[index];
        stringRow += `${cell.status} `;
        index += 1;
      }
      console.log(stringRow);
    }
  }

  printBoardShipsOnly() {
    let index = 0;
    for (let row = 0; row < this.rows; row += 1) {
      let stringRow = '';
      for (let col = 0; col < this.columns; col += 1) {
        const cell = this.board[index];
        stringRow += `${cell.shipIndex ?? 'x'} `;
        index += 1;
      }
      console.log(stringRow);
    }
  }

  printShipsPositions() {
    this.ships.forEach((ship) => {
      console.log(ship.name);
      console.log(ship.positions);
    });
  }
}
