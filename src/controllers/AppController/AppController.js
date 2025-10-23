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
      players: [
        { name: 'Jack Sparrow', isAutoPilotOn: false },
        { name: 'sAIlor moon', isAutoPilotOn: false },
      ],
    };
  }

  changeSettings(type, value) {
    this.gameSetup.settings[type] = value;
    this.screenController.updateSettings(this.gameSetup.settings);
  }

  playGame(playerOneName, playerTwoName) {
    this.gameSetup.players[0].name =
      playerOneName.length === 0 ? 'JACK' : playerOneName;
    this.gameSetup.players[1].name =
      playerTwoName.length === 0 ? 'BARBOSA' : playerTwoName;

    this.gameController = new GameController(this.gameSetup);
    // this.gameController.placePlayersShipsRandomly();
    const testShipPositions = [
      [0, 1, 2, 3, 4],
      [9, 19, 29, 39],
      [40, 41, 42],
      [65, 66, 67],
      [89, 99],
    ];

    this.gameController.players[0].placeShips(testShipPositions);
    this.gameController.players[1].placeShips(testShipPositions);
    // this.gameController.players[1].isAutoPilotOn = true;

    this.gameController.getCurrentPlayer().attacksQueue = [];
    this.playRound();
  }

  async playRound() {
    const winner = this.gameController.getWinner();

    if (winner) {
      this.screenController.updateGameEnd(this.gameController.players, winner);
      return;
    }

    const currentPlayer = this.gameController.getCurrentPlayer();
    const oponentPlayer = this.gameController.getOponentPlayer();

    if (currentPlayer.isAutoPilotOn) {
      const autoAttacks = currentPlayer.autoPilot.getAttackPositions();

      console.log(`PLAYER: ${currentPlayer.name}`);
      console.log(autoAttacks);

      for (let a = 0; a < autoAttacks.length; a += 1) {
        // this.enqueueAttackPosition(autoAttacks[a]);
        await this.delayAndEnqueue(autoAttacks[a]);
        this.screenController.updateRound(currentPlayer, oponentPlayer);
        this.screenController.markTargetCells(currentPlayer.attacksQueue);
      }

      const win = this.gameController.getWinner();

      if (win) {
        this.screenController.updateGameEnd(this.gameController.players, win);
        return;
      }
    }

    this.screenController.updateRound(currentPlayer, oponentPlayer);
    this.screenController.markTargetCells(currentPlayer.attacksQueue);
  }

  async delayAndEnqueue(a) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.enqueueAttackPosition(a);
        resolve();
      }, 100);
    });
  }

  toggleAutoPilot(playerIndex) {
    this.gameController.getCurrentPlayer().isAutoPilotOn =
      !this.gameController.getCurrentPlayer().isAutoPilotOn;

    this.gameSetup.players[playerIndex].isAutoPilotOn =
      !this.gameSetup.players[playerIndex].isAutoPilotOn;

    this.playRound();
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
