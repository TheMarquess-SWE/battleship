import GameController from '../Gamecontroller/GameController.js';

export default class AppController {
  constructor(screenController) {
    this.gameController = undefined;
    this.screenController = screenController;
    this.gameSetup = {
      gameboardSize: 10,
      numberOfShips: 5,
      settings: {
        mode: 'versus',
        difficulty: 'normal',
      },
      playerOneName: 'Jack Sparrow',
      playerTwoName: 'sAIlor moon',
    };
    this.attacksQueue = [];
  }

  changeSettings(type, value) {
    this.gameSetup.settings[type] = value;
    this.screenController.updateSettings(this.gameSetup.settings);
  }

  playGame(playerOneName, playerTwoName) {
    this.gameSetup.playerOneName =
      playerOneName.length === 0 ? 'JACK' : playerOneName;
    this.gameSetup.playerTwoName =
      playerTwoName.length === 0 ? 'BARBOSA' : playerTwoName;

    this.gameController = new GameController(this.gameSetup);
    // this.gameController.placePlayersShipsRandomly();
    const testShipPositions = [
      [0, 1, 2, 3, 4],
      [10, 11, 12, 13],
      [20, 21, 22],
      [30, 31, 32],
      [40, 41],
    ];

    this.gameController.players[0].placeShips(testShipPositions);
    this.gameController.players[1].placeShips(testShipPositions);

    this.gameController.getCurrentPlayer().attacksQueue = [];
    this.playRound();
  }

  playRound() {
    const winner = this.gameController.getWinner();

    if (winner) {
      this.screenController.updateGameEnd(this.gameController.players, winner);
      return;
    }

    const currentPlayer = this.gameController.getCurrentPlayer();
    const oponentPlayer = this.gameController.getOponentPlayer();

    this.screenController.updateRound(currentPlayer, oponentPlayer);
    this.screenController.markTargetCells(currentPlayer.attacksQueue);
  }

  isSalvoMode() {
    return this.gameSetup.settings.difficulty === 'salvo';
  }

  enqueueAttackPosition(cellIndex) {
    const roundFinished = this.gameController.queueAttack(cellIndex);
    this.screenController.markTargetCells(
      this.gameController.getCurrentPlayer().attacksQueue
    );
    this.screenController.updateAttacksLeftHeader(
      this.gameController.getCurrentPlayer().getRoundTargetsLeft()
    );
    if (roundFinished) this.playRound();
  }

  init() {
    this.screenController.init();
    this.screenController.bindGameSettings((type, value) =>
      this.changeSettings(type, value)
    );
    this.screenController.initSettings(this.gameSetup.settings);
    this.screenController.bindStartGame((playerOneName, playerTwoName) =>
      this.playGame(playerOneName, playerTwoName)
    );
    this.screenController.initPlayersBoards(this.gameSetup);
    this.screenController.bindBoardTargetCell((cellIndex) =>
      this.enqueueAttackPosition(cellIndex)
    );
  }
}
