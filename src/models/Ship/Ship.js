const types = [
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

export default class Ship {
  constructor(type = 0) {
    const { name, length } = types[type];
    this.name = name;
    this.length = length;
    this.sections = new Array(this.length).fill(0);
    this.positions = [];
    this.hits = 0;
  }

  hit(section) {
    if (this.isHit(section)) return false;
    this.sections[section] = 1;
    this.hits += 1;
    return true;
  }

  isHit(section) {
    return this.sections[section];
  }

  isSunk() {
    return this.hits === this.length;
  }
}
