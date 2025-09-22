export default class Cell {
  constructor(index, row, column) {
    this.status = 0;
    this.index = index;
    this.isOccupied = false;
    this.shipIndex = null;
    this.shipType = null;
    this.shipSection = null;
    this.coordinates = [row, column];
  }
}
