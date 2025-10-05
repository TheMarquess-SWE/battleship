export default class AutoPilot {
  constructor(oponentGameboard) {
    this.targetBoard = oponentGameboard.board;
  }

  getAttackPositions(numberOfAttacks) {}

  findHitCells() {
    const cellsIndex = [];

    for (let i = 0; i < this.targetBoard.length; i += 1) {
      const cell = this.targetBoard[i];

      if (cell.status === 2) {
        cellsIndex.push(cell.index);
      }
    }

    if (cellsIndex.length === 0) {
      return false;
    }

    return cellsIndex;
  }
}
