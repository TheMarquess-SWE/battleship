export default class AutoPilot {
  constructor(player, oponentGameboard) {
    this.player = player;
    this.targetGameboard = oponentGameboard;
    this.targetBoard = this.targetGameboard.board;
    this.totalShips = this.targetGameboard.ships.length;
    this.shipLengths = [5, 4, 3, 3, 2];
    this.targetShips = new Array(this.totalShips)
      .fill(null)
      .map((ship, index) => ({
        index,
        positions: [],
        length: this.shipLengths[index % this.totalShips],
        isSunk: false,
      }));
    this.directions = [
      { dir: 'up', val: -10 },
      { dir: 'right', val: 1 },
      { dir: 'down', val: 10 },
      { dir: 'left', val: -1 },
    ];
  }

  getAttackPositions() {
    const hitCells = this.findHitCells();
    let attackPositions = [];

    if (!hitCells) {
      return this.getRandomAttackPositions();
    }

    attackPositions = this.explorePositions(hitCells);
    return attackPositions;
  }

  findHitCells() {
    const cellsIndex = [];
    const sunkShipsIndex = [];

    for (let i = 0; i < this.targetBoard.length; i += 1) {
      const cell = this.targetBoard[i];

      if (cell.status === 2) {
        cellsIndex.push(cell.index);
      }

      if (cell.status === 3) {
        sunkShipsIndex.push(cell.index);
      }
    }
    if (sunkShipsIndex.length !== 0) {
      this.registerSunkShips(sunkShipsIndex);
    }

    if (cellsIndex.length === 0) {
      return false;
    }

    return cellsIndex;
  }

  registerSunkShips(positions) {
    const remainingPositions = positions;

    this.targetShips.forEach((ship) => {
      const foundPositions = this.findPositionsForShipLength(
        ship.length,
        remainingPositions
      );

      foundPositions.forEach((p) => {
        const i = remainingPositions.findIndex((el) => p === el);
        remainingPositions.splice(i, 1);
      });

      if (foundPositions.length > 0) {
        ship.positions = foundPositions;
        ship.isSunk = true;
      }
    });
  }

  findPositionsForShipLength(length, positions) {
    let shipPos = [];

    for (let pos = 0; pos < positions.length; pos += 1) {
      const head = positions[pos];
      shipPos = [head];

      for (let dir = 0; dir < this.directions.length; dir += 1) {
        for (let i = 1; i <= length; i += 1) {
          const next = head + i * this.directions[dir].val;
          if (positions.includes(next)) shipPos.push(next);
          if (shipPos.length === length) return shipPos;
        }
      }
    }
    return [];
  }

  getPositionsLeft(ship) {
    return ship.length - ship.positions.length;
  }

  explorePositions(hitCells) {
    this.assignHitsToShips(hitCells);

    if (hitCells.length === 1) {
      return this.getAttacksAroundPosition(
        hitCells[0],
        this.player.getRoundTargetsLeft()
      );
    }

    const shipsAlive = [];
    const positions = [];

    this.targetShips.forEach((ship) => {
      if (!ship.isSunk) shipsAlive.push(ship);
    });

    let numberOfAttacks = this.player.getRoundTargetsLeft();

    while (numberOfAttacks > 0) {
      const shipCandidate = this.findShipCandidate(shipsAlive);

      if (!shipCandidate) {
        for (let i = 0; i < numberOfAttacks; i += 1) {
          positions.push(this.getRandomAttackPosition());
        }
      }

      if (shipCandidate) {
        const index = shipsAlive.findIndex(
          (ship) => ship.index === shipCandidate.index
        );
        shipsAlive.splice(index, 1);

        numberOfAttacks =
          numberOfAttacks >= this.getPositionsLeft(shipCandidate)
            ? this.getPositionsLeft(shipCandidate)
            : numberOfAttacks;

        positions.push(
          ...this.getAttackPositionsForCandidate(shipCandidate, numberOfAttacks)
        );
      }

      numberOfAttacks = this.player.getRoundTargetsLeft() - positions.length;
    }

    return positions;
  }

  findShipCandidate(shipsAlive) {
    let shipCandidate = shipsAlive[0];

    if (shipsAlive.length > 1) {
      for (let i = 1; i < shipsAlive.length; i += 1) {
        const comparingShip = shipsAlive[i];
        if (
          this.getPositionsLeft(comparingShip) <
            this.getPositionsLeft(shipCandidate) &&
          comparingShip.positions.length > 0
        )
          shipCandidate = comparingShip;
      }
    }

    if (shipCandidate.positions.length === 0) return undefined;

    return shipCandidate;
  }

  getAttackPositionsForCandidate(shipCandidate, numberOfAttacks) {
    const positions = [];
    if (shipCandidate.positions.length > 1) {
      const rowsCols = this.targetGameboard.rows;

      const sameRow = shipCandidate.positions.every(
        (position) =>
          Math.floor(position / rowsCols) ===
          Math.floor(shipCandidate.positions[0] / rowsCols)
      );

      const sameColumn = shipCandidate.positions.every(
        (position) =>
          position % rowsCols === shipCandidate.positions[0] % rowsCols
      );

      let dirs;
      let isRow = false;

      if (sameRow) {
        dirs = [-1, 1];
        isRow = true;
      }
      if (sameColumn) {
        dirs = [-10, 10];
      }
      const head = shipCandidate.positions[0];
      const tail = shipCandidate.positions[shipCandidate.positions.length - 1];
      const dirOne = this.targetGameboard.isValidAttack(head + dirs[0]);
      const dirTwo = this.targetGameboard.isValidAttack(tail + dirs[1]);
      const dirOneValue = dirs[0];
      const dirTwoValue = dirs[1];

      if (dirOne && !dirTwo) {
        const attacks = this.getAttacksFromDirection(
          numberOfAttacks,
          head,
          dirOneValue,
          isRow
        );
        positions.push(...attacks);
      }

      if (!dirOne && dirTwo) {
        const attacks = this.getAttacksFromDirection(
          numberOfAttacks,
          tail,
          dirTwoValue,
          isRow
        );
        positions.push(...attacks);
      }

      if (dirOne && dirTwo) {
        const numberOfAttacksDirOne = Math.floor(numberOfAttacks / 2);
        const numberOfAttacksDirTwo = numberOfAttacks - numberOfAttacksDirOne;

        const attacksDirOne = this.getAttacksFromDirection(
          numberOfAttacksDirOne,
          head,
          dirOneValue,
          isRow
        );
        const attacksDirTwo = this.getAttacksFromDirection(
          numberOfAttacksDirTwo,
          tail,
          dirTwoValue,
          isRow
        );

        positions.push(...attacksDirOne);
        positions.push(...attacksDirTwo);
      }
    }

    if (shipCandidate.positions.length === 1) {
      positions.push(
        ...this.getAttacksAroundPosition(
          shipCandidate.positions[0],
          numberOfAttacks
        )
      );
    }

    return positions;
  }

  getAttacksFromDirection(numberOfAttacks, start, dir, isRow) {
    let head = start;
    let positions = [];
    let min;
    let max;
    const { rows, columns } = this.targetGameboard;
    const row = Math.floor(start / rows);
    const col = start - row * columns;

    if (!isRow) {
      min = 0 + col;
      max = (rows - 1) * columns + col;
    }

    if (isRow) {
      min = row * columns;
      max = min + columns - 1;
    }

    for (let i = 0; i < numberOfAttacks; i += 1) {
      const next = head + dir;
      if (
        !this.targetGameboard.isValidAttack(next) ||
        next < min ||
        next > max ||
        this.player.attacksQueue.includes(next)
      )
        break;
      head = next;
      positions.push(next);
    }

    return positions;
  }

  assignHitsToShips(hitCells) {
    const shipsAlive = [];
    const unassignedHits = [...hitCells];
    this.targetShips.forEach((ship) => {
      if (!ship.isSunk) shipsAlive.push(ship);
    });

    shipsAlive.forEach(({ length, index }) => {
      let positions = [];
      let shipLength = length;
      while (positions.length === 0 && unassignedHits.length !== 0) {
        positions = this.findPositionsForShipLength(shipLength, unassignedHits);
        shipLength -= 1;
      }
      if (positions.length === length) positions = [];

      this.targetShips[index].positions = positions;

      positions.forEach((p) => {
        const i = unassignedHits.findIndex((el) => el === p);
        unassignedHits.splice(i, 1);
      });
    });
  }

  getAttacksAroundPosition(position, numberOfAttacks) {
    const positions = [];
    const maxAttacks = numberOfAttacks;
    const head = position;
    let loopCounter = 1;
    let dirCounter = 0;

    while (positions.length < maxAttacks) {
      if (dirCounter > 3) {
        dirCounter = 0;
        loopCounter += 1;
      }

      const next = head + this.directions[dirCounter].val * loopCounter;

      if (
        this.targetGameboard.isValidAttack(next) &&
        !this.player.attacksQueue.includes(next)
      )
        positions.push(next);

      dirCounter += 1;
    }

    return positions;
  }

  getRandomAttackPositions() {
    const attackPositions = [];
    for (let i = 0; i < this.player.getRoundTargetsLeft(); i += 1) {
      attackPositions.push(this.getRandomAttackPosition());
    }

    return attackPositions;
  }

  getRandomAttackPosition() {
    let position = -1;

    while (
      !this.targetGameboard.isValidAttack(position) &&
      !this.player.attacksQueue.includes(position)
    ) {
      position = Math.floor(Math.random() * this.targetGameboard.size);
    }

    return position;
  }
}
