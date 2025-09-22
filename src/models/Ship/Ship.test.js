import Ship from './Ship';

describe('Ship', () => {
  it('should exist', () => {
    expect(new Ship()).toBeDefined();
  });

  const testShips = [
    {
      name: 'carrier',
      length: 5,
    },
    {
      name: 'battleship',
      length: 4,
    },
    {
      name: 'destroyer',
      length: 3,
    },
    {
      name: 'submarine',
      length: 3,
    },
    {
      name: 'patrol boat',
      length: 2,
    },
  ];

  testShips.forEach((testShip, index) => {
    describe(`Type ${testShip.name}`, () => {
      const ship = new Ship(index);

      it(`Ship(${index}).name should be ${testShip.name}`, () => {
        expect(ship.name).toBe(testShip.name);
      });

      it(`Ship(${index}).length should be ${testShip.length}`, () => {
        expect(ship.length).toBe(testShip.length);
      });

      it('should not be sunk yet', () => {
        expect(ship.isSunk()).toBe(false);
      });

      it(`hit() ${testShip.length - 1} sections of ship should reflect ${testShip.length - 1} hits`, () => {
        for (let section = 0; section < testShip.length - 1; section += 1) {
          ship.hit(section);
        }
        expect(ship.hits).toBe(testShip.length - 1);
      });

      it('hit() the same ship section should return false', () => {
        expect(ship.hit(0)).toBe(false);
      });

      it('should sink after all ship sections are hit()', () => {
        ship.hit(testShip.length - 1);
        expect(ship.isSunk()).toBe(true);
      });
    });
  });
});
