import Gameboard from './Gameboard.js';

describe('Gameboard', () => {
  let gameboard = new Gameboard();
  it('should exist', () => {
    expect(gameboard).toBeDefined();
  });
  const shipTypes = [
    'carrier',
    'battleship',
    'destroyer',
    'submarine',
    'patrol boat',
  ];
  const testPositions = [
    // Ship 0: length 5
    [0, [0, 1, 2, 3, 4], true], // horizontal top row
    [0, [0, 10, 20, 30, 40], true], // vertical first column
    [0, [0, 2, 3, 4, 6], false], // horizontal, not continuous
    [0, [0, 11, 22, 33, 44], false], // diagonal, invalid
    [0, [95, 96, 97, 98, 99], true], // horizontal bottom row
    [0, [90, 91, 92, 93, 100], false], // out of range

    // Ship 1: length 4
    [1, [10, 11, 12, 13], true], // horizontal
    [1, [10, 20, 30, 40], true], // vertical
    [1, [10, 12, 13, 14], false], // discontinuous
    [1, [10, 21, 32, 43], false], // diagonal

    // Ship 2: length 3
    [2, [22, 23, 24], true], // horizontal
    [2, [2, 12, 22], true], // vertical
    [2, [2, 3, 5], false], // discontinuous
    [2, [2, 13, 24], false], // diagonal

    // Ship 3: length 3
    [3, [77, 78, 79], true], // horizontal
    [3, [7, 17, 27], true], // vertical
    [3, [7, 18, 29], false], // diagonal
    [3, [77, 78, 80], false], // discontinuous

    // Ship 4: length 2
    [4, [55, 56], true], // horizontal
    [4, [5, 15], true], // vertical
    [4, [5, 16], false], // discontinuous
    [4, [55, 65], true], // vertical
    [4, [98, 99], true], // horizontal bottom row
    [4, [99, 100], false], // out of range
  ];
  describe('placeShip()', () => {
    beforeEach(() => {
      gameboard = new Gameboard();
    });

    testPositions.forEach(([type, positions, expected]) => {
      it(`place '${shipTypes[type]}' at ${positions} should return ${expected}`, () => {
        expect(gameboard.placeShip(type, positions)).toBe(expected);
      });
    });

    it('should return false when the position is occupied', () => {
      gameboard.placeShip(0, [0, 1, 2, 3, 4]);
      expect(gameboard.placeShip(0, [0, 1, 2, 3, 4])).toBe(false);
    });
  });

  describe('receiveAttack', () => {
    let emptyCell;
    let battleship;
    let battleshipCells;

    beforeEach(() => {
      gameboard = new Gameboard();
      gameboard.placeAllShipsRandomly();
      emptyCell = gameboard.board.find((cell) => !cell.isOccupied);

      [battleship] = gameboard.ships;
      battleshipCells = battleship.positions.map((i) => gameboard.board[i]);
    });

    it('miss attack should mark 1', () => {
      gameboard.receiveAttack(emptyCell.index);
      expect(emptyCell.status).toBe(1);
    });

    it('hit attack should mark 2', () => {
      gameboard.receiveAttack(battleshipCells[0].index);
      expect(battleshipCells[0].status).toBe(2);
    });

    it('sink attack should mark 3', () => {
      // hit the rest of the ship
      for (let i = 0; i < battleship.length; i += 1) {
        gameboard.receiveAttack(battleshipCells[i].index);
      }
      expect(battleshipCells.every((c) => c.status === 3)).toBe(true);
    });
  });

  describe('shipsAlive - areAllShipsSunk', () => {
    beforeEach(() => {
      gameboard = new Gameboard();
      gameboard.placeAllShipsRandomly();
    });

    it('there should be 4 ships alive if only 1 is sunk', () => {
      gameboard.sinkShip(0);
      expect(gameboard.shipsAlive()).toBe(4);
    });

    it('there should be 1 ship alive if 4 are sunk', () => {
      gameboard.sinkShip(0);
      gameboard.sinkShip(1);
      gameboard.sinkShip(2);
      gameboard.sinkShip(3);
      expect(gameboard.shipsAlive()).toBe(1);
    });

    it('areAllShipsSunk() should return true if all ships are sunk', () => {
      gameboard.sinkAllShips();
      expect(gameboard.allShipsSunk()).toBe(true);
    });
  });
});
