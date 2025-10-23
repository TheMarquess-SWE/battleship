import Gameboard from '../Gameboard/Gameboard.js';
import AutoPilot from './AutoPilot.js';
import Player from '../Player/Player.js';

describe('AutoPilot', () => {
  const testsNoHits = [
    {
      sunkShips: [],
      hitPositions: [],
      attacksQueue: [],
      expectedNumberOfAttacks: 5,
    },
    {
      sunkShips: [0],
      hitPositions: [],
      attacksQueue: [],
      expectedNumberOfAttacks: 4,
    },
    {
      sunkShips: [0, 1, 2, 3],
      hitPositions: [],
      attacksQueue: [],
      expectedNumberOfAttacks: 1,
    },
    {
      sunkShips: [0, 1, 2, 3, 4],
      hitPositions: [],
      attacksQueue: [],
      expectedNumberOfAttacks: 0,
    },
    {
      sunkShips: [],
      hitPositions: [],
      attacksQueue: [20, 21],
      expectedNumberOfAttacks: 3,
    },
    {
      sunkShips: [],
      hitPositions: [24, 25, 26, 27, 28],
      attacksQueue: [20, 21],
      expectedNumberOfAttacks: 3,
    },
    {
      sunkShips: [],
      hitPositions: [35],
      attacksQueue: [20, 21],
      expectedNumberOfAttacks: 3,
    },
  ];

  const testsOneHit = [
    {
      sunkShips: [],
      hitPositions: [42],
      attacksQueue: [],
      expectedAttacks: [32, 43, 52, 41],
      expectedNumberOfAttacks: 5,
    },
    {
      sunkShips: [0, 1, 2, 3],
      hitPositions: [42],
      attacksQueue: [],
      expectedAttacks: [32],
      expectedNumberOfAttacks: 1,
    },
    {
      sunkShips: [1],
      hitPositions: [42],
      attacksQueue: [],
      expectedAttacks: [32, 43, 52, 41],
      expectedNumberOfAttacks: 4,
    },
    {
      sunkShips: [],
      hitPositions: [99],
      attacksQueue: [],
      expectedAttacks: [89, 98],
      expectedNumberOfAttacks: 5,
    },
    {
      sunkShips: [],
      hitPositions: [99],
      attacksQueue: [89, 79],
      expectedAttacks: [],
      expectedNumberOfAttacks: 3,
    },
  ];

  const testsMoreHits = [
    {
      sunkShips: [],
      hitPositions: [0, 1],
      attacksQueue: [],
      expectedAttacks: [2, 3, 4],
      expectedNumberOfAttacks: 5,
    },
    {
      sunkShips: [],
      hitPositions: [40, 41, 65, 66],
      attacksQueue: [],
      expectedAttacks: [42],
      expectedNumberOfAttacks: 5,
    },
    {
      sunkShips: [],
      hitPositions: [19, 29],
      attacksQueue: [],
      expectedAttacks: [9, 39],
      expectedNumberOfAttacks: 5,
    },
    {
      sunkShips: [],
      hitPositions: [89],
      attacksQueue: [],
      expectedAttacks: [99],
      expectedNumberOfAttacks: 5,
    },
    {
      sunkShips: [0, 1, 2],
      hitPositions: [40, 41],
      attacksQueue: [],
      expectedAttacks: [42],
      expectedNumberOfAttacks: 2,
    },
    {
      sunkShips: [0, 2, 3],
      hitPositions: [9, 19],
      attacksQueue: [],
      expectedAttacks: [29, 39],
      expectedNumberOfAttacks: 2,
    },
    {
      sunkShips: [0, 2, 3],
      hitPositions: [9, 19],
      attacksQueue: [29],
      expectedAttacks: [],
      expectedNumberOfAttacks: 1,
    },
  ];

  describe('getAttackPositions', () => {
    let player;
    let oponentGameboard;
    let autoPilot;

    beforeEach(() => {
      player = new Player('A', 10, 5, true);
      oponentGameboard = new Gameboard(10, 5);
      const shipPositions = [
        [0, 1, 2, 3, 4],
        [9, 19, 29, 39],
        [40, 41, 42],
        [65, 66, 67],
        [89, 99],
      ];
      shipPositions.forEach((positions, shipIndex) => {
        player.placeShip(shipIndex, positions);
        oponentGameboard.placeShip(shipIndex, positions);
      });
    });

    describe('with no hits (status 2) on the board', () => {
      testsNoHits.forEach(
        (
          { sunkShips, hitPositions, attacksQueue, expectedNumberOfAttacks },
          index
        ) => {
          it(`#${index}: should return ${expectedNumberOfAttacks} attacks when ${sunkShips.length} ships sunk, board has ${hitPositions.length} hit positions, has ${attacksQueue.length} attacks on queue`, () => {
            if (sunkShips.length > 0) {
              sunkShips.forEach((shipIndex) => {
                player.sinkShip(shipIndex);
              });
            }

            if (hitPositions.length > 0)
              hitPositions.forEach((position) =>
                oponentGameboard.receiveAttack(position)
              );

            if (attacksQueue.length > 0)
              attacksQueue.forEach((attack) => player.enqueueAttack(attack));

            autoPilot = new AutoPilot(player, oponentGameboard);

            expect(autoPilot.getAttackPositions().length).toBe(
              expectedNumberOfAttacks
            );
          });
        }
      );

      describe('Only 1 hit registered', () => {
        testsOneHit.forEach(
          (
            {
              sunkShips,
              hitPositions,
              attacksQueue,
              expectedAttacks,
              expectedNumberOfAttacks,
            },
            index
          ) => {
            it(`#${index}: should return ${expectedNumberOfAttacks} attacks (${expectedAttacks}) when ${sunkShips.length} ships sunk, board has ${hitPositions.length} hit positions, has ${attacksQueue.length} attacks on queue`, () => {
              if (sunkShips.length > 0) {
                sunkShips.forEach((shipIndex) => {
                  player.sinkShip(shipIndex);
                });
              }

              if (hitPositions.length > 0)
                hitPositions.forEach((position) =>
                  oponentGameboard.receiveAttack(position)
                );

              if (attacksQueue.length > 0)
                attacksQueue.forEach((attack) => player.enqueueAttack(attack));

              autoPilot = new AutoPilot(player, oponentGameboard);
              const attacks = autoPilot.getAttackPositions();

              expect(expectedAttacks.every((p) => attacks.includes(p))).toBe(
                true
              );

              expect(attacks.length).toBe(expectedNumberOfAttacks);
            });
          }
        );
      });

      describe('multiple hits registered', () => {
        testsMoreHits.forEach(
          (
            {
              sunkShips,
              hitPositions,
              attacksQueue,
              expectedAttacks,
              expectedNumberOfAttacks,
            },
            index
          ) => {
            it(`#${index}: should return ${expectedNumberOfAttacks} attacks (${expectedAttacks}) when ${sunkShips.length} ships sunk, board has ${hitPositions.length} hit positions, has ${attacksQueue.length} attacks on queue`, () => {
              if (sunkShips.length > 0) {
                sunkShips.forEach((shipIndex) => {
                  player.sinkShip(shipIndex);
                });
              }

              if (hitPositions.length > 0)
                hitPositions.forEach((position) =>
                  oponentGameboard.receiveAttack(position)
                );

              if (attacksQueue.length > 0)
                attacksQueue.forEach((attack) => player.enqueueAttack(attack));

              autoPilot = new AutoPilot(player, oponentGameboard);

              const attackPositions = autoPilot.getAttackPositions();

              expect(
                expectedAttacks.every((p) => attackPositions.includes(p))
              ).toBe(true);
              expect(attackPositions.length).toBe(expectedNumberOfAttacks);
            });
          }
        );
      });
    });
  });

  describe('registerSunkShips', () => {
    let player;
    let oponentGameboard;
    let autoPilot;

    beforeEach(() => {
      player = new Player('A', 10, 5, true);
      oponentGameboard = new Gameboard(10, 5);
      const shipPositions = [
        [0, 1, 2, 3, 4],
        [9, 19, 29, 39],
        [40, 41, 42],
        [65, 66, 67],
        [89, 99],
      ];
      shipPositions.forEach((positions, shipIndex) => {
        player.placeShip(shipIndex, positions);
        oponentGameboard.placeShip(shipIndex, positions);
      });
    });

    it('should register 5 ship positions when 5 ships are sunk', () => {
      oponentGameboard.sinkAllShips();
      autoPilot = new AutoPilot(player, oponentGameboard);
      autoPilot.getAttackPositions();
      const pos = [];
      autoPilot.targetShips.forEach((ship) => pos.push(ship.positions));

      expect(pos).toEqual([
        [0, 1, 2, 3, 4],
        [9, 19, 29, 39],
        [40, 41, 42],
        [65, 66, 67],
        [89, 99],
      ]);
      expect(autoPilot.targetShips.every((ship) => ship.isSunk)).toBe(true);
    });

    it('should register 1 ship positions when 1 ship is sunk', () => {
      oponentGameboard.sinkShip(0);
      autoPilot = new AutoPilot(player, oponentGameboard);
      autoPilot.getAttackPositions();
      const pos = [];
      autoPilot.targetShips.forEach((ship) => pos.push(ship.positions));

      expect(pos).toEqual([[0, 1, 2, 3, 4], [], [], [], []]);
      expect(autoPilot.targetShips.every((ship) => ship.isSunk)).toBe(false);
    });
  });

  describe('registerHitsToShips', () => {
    let player;
    let oponentGameboard;
    let autoPilot;

    beforeEach(() => {
      player = new Player('A', 10, 5, true);
      oponentGameboard = new Gameboard(10, 5);
      const shipPositions = [
        [0, 1, 2, 3, 4],
        [9, 19, 29, 39],
        [40, 41, 42],
        [65, 66, 67],
        [89, 99],
      ];
      shipPositions.forEach((positions, shipIndex) => {
        player.placeShip(shipIndex, positions);
        oponentGameboard.placeShip(shipIndex, positions);
      });
    });

    it('should assign 1 hit to each ship', () => {
      oponentGameboard.receiveAttack(0);
      oponentGameboard.receiveAttack(9);
      oponentGameboard.receiveAttack(40);
      oponentGameboard.receiveAttack(65);
      oponentGameboard.receiveAttack(89);

      autoPilot = new AutoPilot(player, oponentGameboard);
      autoPilot.getAttackPositions();
      const pos = [];
      autoPilot.targetShips.forEach((ship) => pos.push(ship.positions));

      expect(pos).toEqual([[0], [9], [40], [65], [89]]);
    });

    it('should assign 2 hits to 1 ship', () => {
      oponentGameboard.receiveAttack(0);
      oponentGameboard.receiveAttack(1);

      autoPilot = new AutoPilot(player, oponentGameboard);
      autoPilot.getAttackPositions();
      const pos = [];
      autoPilot.targetShips.forEach((ship) => pos.push(ship.positions));

      expect(pos).toEqual([[0, 1], [], [], [], []]);
    });

    it('should assign 3 hits to ship of length 4', () => {
      oponentGameboard.sinkShip(0);
      oponentGameboard.receiveAttack(9);
      oponentGameboard.receiveAttack(19);
      oponentGameboard.receiveAttack(29);

      autoPilot = new AutoPilot(player, oponentGameboard);
      autoPilot.getAttackPositions();
      const pos = [];
      autoPilot.targetShips.forEach((ship) => pos.push(ship.positions));
      expect(pos).toEqual([[0, 1, 2, 3, 4], [9, 19, 29], [], [], []]);
    });

    it('should assign 1 hit to ship of length 2', () => {
      oponentGameboard.sinkShip(0);
      oponentGameboard.sinkShip(1);
      oponentGameboard.sinkShip(2);
      oponentGameboard.sinkShip(3);
      oponentGameboard.receiveAttack(99);

      autoPilot = new AutoPilot(player, oponentGameboard);
      autoPilot.getAttackPositions();
      const pos = [];
      autoPilot.targetShips.forEach((ship) => pos.push(ship.positions));
      expect(pos).toEqual([
        [0, 1, 2, 3, 4],
        [9, 19, 29, 39],
        [40, 41, 42],
        [65, 66, 67],
        [99],
      ]);
    });
  });
});
