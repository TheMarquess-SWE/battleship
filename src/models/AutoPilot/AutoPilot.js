export default class AutoPilot {
  static DIRECTIONS = [
    { dir: 'up', val: -10 },
    { dir: 'right', val: 1 },
    { dir: 'down', val: 10 },
    { dir: 'left', val: -1 },
  ];
  static SHIP_LENGTHS = [5, 4, 3, 3, 2];

  constructor(player, oponentGameboard) {
    this.player = player;
    this.targetGameboard = oponentGameboard;
    this.targetBoard = this.targetGameboard.board;
    const totalShips = this.targetGameboard.ships.length;
    this.targetShips = new Array(totalShips).fill(null).map((_, index) => ({
      index,
      positions: [],
      length: AutoPilot.SHIP_LENGTHS[index % AutoPilot.SHIP_LENGTHS.length],
      isSunk: false,
    }));
    this.looseHits = [];
  }

  findCurrentHits() {
    const hitCells = [];
    const sunkCells = [];
    for (const cell of this.targetBoard) {
      if (cell.status === 2) {
        hitCells.push(cell.index);
      }
      if (cell.status === 3) {
        sunkCells.push(cell.index);
      }
    }
    return { hitCells, sunkCells };
  }

  getAttackPositions() {
    const { hitCells, sunkCells } = this.findCurrentHits();
    if (sunkCells.length > 0) {
      this.registerSunkShips(sunkCells);
    }

    const attacksCount = this.player.getRoundTargetsLeft();
    const uniqueAttacks = new Set();
    let positions;

    if (hitCells.length > 0) {
      this.assignHitsToShips(hitCells);
      positions = this.explorePositions(attacksCount, uniqueAttacks);
    } else {
      positions = this.getRandomAttackPositions(attacksCount, uniqueAttacks);
    }

    return positions;
  }

  registerSunkShips(sunkPositions) {
    let remainingPositions = [...sunkPositions];
    this.targetShips
      .filter((ship) => !ship.isSunk)
      .forEach((ship) => {
        const foundPositions = this.findContiguousPositions(
          ship.length,
          remainingPositions
        );

        if (foundPositions.length === ship.length) {
          ship.positions = foundPositions;
          ship.isSunk = true;
          remainingPositions = remainingPositions.filter(
            (p) => !foundPositions.includes(p)
          );
        }
      });
  }

  findContiguousPositions(length, positions) {
    const sortedPositions = [...positions].sort((a, b) => a - b);
    const rowsCols = this.targetGameboard.rows;

    for (const head of sortedPositions) {
      for (const { val } of AutoPilot.DIRECTIONS.filter(
        (d) => Math.abs(d.val) > 0
      )) {
        const potentialShip = [head];

        for (let i = 1; i < length; i += 1) {
          const next = head + i * val;

          if (sortedPositions.includes(next)) {
            const isHorizontal = Math.abs(val) === 1;

            if (
              isHorizontal &&
              Math.floor(next / rowsCols) !== Math.floor(head / rowsCols)
            ) {
              break;
            }
            potentialShip.push(next);
          } else {
            break;
          }
        }

        if (potentialShip.length === length) {
          return potentialShip.sort((a, b) => a - b);
        }
      }
    }
    return [];
  }

  assignHitsToShips(hitCells) {
    let unassignedHits = [...hitCells];
    this.looseHits = [];

    this.targetShips.forEach((ship) => {
      if (!ship.isSunk) ship.positions = [];
    });

    const shipsByLength = this.targetShips
      .filter((ship) => !ship.isSunk)
      .sort((a, b) => b.length - a.length);

    shipsByLength.forEach((ship) => {
      for (let len = ship.length; len >= 1; len -= 1) {
        const foundPositions = this.findContiguousPositions(
          len,
          unassignedHits
        );

        if (foundPositions.length === len) {
          ship.positions = foundPositions;
          unassignedHits = unassignedHits.filter(
            (p) => !foundPositions.includes(p)
          );
          break;
        }
      }
    });

    if (unassignedHits.length > 0) {
      this.looseHits.push(...unassignedHits);
    }
  }

  explorePositions(numberOfAttacks, uniqueAttacks) {
    const attacks = [];
    const shipsAlive = this.targetShips.filter((ship) => !ship.isSunk);

    const shipCandidates = shipsAlive
      .filter((ship) => ship.positions.length > 0)
      .sort(
        (a, b) => b.positions.length - a.positions.length || a.length - b.length
      );

    for (const shipCandidate of shipCandidates) {
      if (numberOfAttacks <= 0) break;

      const positionsToTake = Math.min(
        numberOfAttacks,
        shipCandidate.length - shipCandidate.positions.length
      );

      const targetAttacks = this.getTargetAttacks(
        shipCandidate,
        positionsToTake,
        uniqueAttacks
      );

      attacks.push(...targetAttacks);
      targetAttacks.forEach((pos) => uniqueAttacks.add(pos));
      numberOfAttacks -= targetAttacks.length;
    }

    let looseHitsIndex = 0;

    while (numberOfAttacks > 0 && looseHitsIndex < this.looseHits.length) {
      const numOfAttacks = Math.min(numberOfAttacks, 4);
      const looseHitPosition = this.looseHits[looseHitsIndex];

      if (this.targetGameboard.board[looseHitPosition].status === 2) {
        const targetAttacks = this.getAttacksAroundPosition(
          looseHitPosition,
          numOfAttacks,
          uniqueAttacks
        );

        attacks.push(...targetAttacks);
        targetAttacks.forEach((pos) => uniqueAttacks.add(pos));
        numberOfAttacks -= targetAttacks.length;
      }

      looseHitsIndex += 1;
    }

    if (numberOfAttacks > 0) {
      const randomAttacks = this.getRandomAttackPositions(
        numberOfAttacks,
        uniqueAttacks
      );
      attacks.push(...randomAttacks);
    }

    return attacks;
  }

  getTargetAttacks(shipCandidate, numberOfAttacks, uniqueAttacks) {
    if (shipCandidate.positions.length === 1) {
      return this.getAttacksAroundPosition(
        shipCandidate.positions[0],
        numberOfAttacks,
        uniqueAttacks
      );
    }
    const positions = shipCandidate.positions.sort((a, b) => a - b);
    const head = positions[0];
    const tail = positions[positions.length - 1];
    const rowsCols = this.targetGameboard.rows;
    const isHorizontal =
      Math.floor(head / rowsCols) === Math.floor(tail / rowsCols);
    const dirVals = isHorizontal ? [-1, 1] : [-10, 10];

    const attacks = [];
    for (let i = 0; i < 2; i += 1) {
      const startPos = i === 0 ? head : tail;
      const dirVal = dirVals[i];
      const attacksLeft = numberOfAttacks - attacks.length;

      if (attacksLeft > 0) {
        const currentAttacks = this.getAttacksInDirection(
          startPos,
          dirVal,
          Math.ceil(attacksLeft / (2 - i)),
          uniqueAttacks
        );
        attacks.push(...currentAttacks);
        currentAttacks.forEach((pos) => uniqueAttacks.add(pos));
      }
    }
    return attacks;
  }

  getAttacksInDirection(start, dir, maxAttacks, uniqueAttacks) {
    const positions = [];
    let currentPos = start;

    for (let i = 0; i < maxAttacks; i += 1) {
      const next = currentPos + dir;

      if (!this.isValidHuntPosition(next) || uniqueAttacks.has(next)) break;

      positions.push(next);
      currentPos = next;
    }

    return positions;
  }

  getAttacksAroundPosition(position, numberOfAttacks, uniqueAttacks) {
    const attacks = [];

    for (const { val } of AutoPilot.DIRECTIONS) {
      const next = position + val;

      if (
        attacks.length < numberOfAttacks &&
        this.isValidHuntPosition(next) &&
        !uniqueAttacks.has(next)
      ) {
        attacks.push(next);
        uniqueAttacks.add(next);
      }
    }

    return attacks;
  }

  getRandomAttackPositions(count, uniqueAttacks) {
    const attackPositions = [];
    for (let i = 0; i < count; i += 1) {
      attackPositions.push(this.getRandomAttackPosition(uniqueAttacks));
    }
    return attackPositions;
  }

  getRandomAttackPosition(uniqueAttacks) {
    let position = -1;
    const boardSize = this.targetGameboard.size || 100;

    do {
      position = Math.floor(Math.random() * boardSize);
    } while (
      !this.isValidHuntPosition(position) ||
      uniqueAttacks.has(position)
    );

    uniqueAttacks.add(position);
    return position;
  }

  isValidHuntPosition(position) {
    return (
      this.targetGameboard.isValidAttack(position) &&
      !this.player.attacksQueue.includes(position)
    );
  }
}
