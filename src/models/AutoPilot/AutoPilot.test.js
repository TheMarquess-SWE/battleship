import Gameboard from '../Gameboard/Gameboard';
import AutoPilot from './AutoPilot';

describe('AutoPilot', () => {
  const testGameboard = new Gameboard(10, 5);
  const attackedPositions = [0, 29, 42, 65, 99];
  const shipPositions = [
    [0, 1, 2, 3, 4],
    [9, 19, 29, 39],
    [40, 41, 42],
    [65, 66, 67],
    [89, 99],
  ];

  shipPositions.forEach((positions, shipIndex) =>
    testGameboard.placeShip(shipIndex, positions)
  );

  attackedPositions.forEach((positon) => testGameboard.receiveAttack(positon));

  const autoPilot = new AutoPilot(testGameboard);

  describe('findHitCells', () => {
    it('should return false if there are no cells hit', () => {
      const tempAutoPilot = new AutoPilot(new Gameboard());
      expect(tempAutoPilot.findHitCells()).toBe(false);
    });

    it('should find all the cells that have been hit', () => {
      expect(autoPilot.findHitCells()).toEqual(attackedPositions);
    });
  });
});
