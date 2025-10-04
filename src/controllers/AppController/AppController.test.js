import AppController from './AppController.js';

describe('AppController', () => {
  const mockScreenController = {
    init: () => true,
    bindGameSettings: () => true,
    initSettings: () => true,
    updateSettings: () => true,
    updateGameEnd: () => true,
    updateRound: () => true,
    markTargetCells: () => true,
    bindStartGame: () => true,
    initPlayersBoards: () => true,
    bindBoardTargetCell: () => true,
  };

  const app = new AppController(mockScreenController);
  app.init();

  const testGameSetup = {
    gameboardSize: 10,
    numberOfShips: 5,
    settings: {
      mode: 'versus',
      difficulty: 'normal',
    },
    playerOneName: 'Jack Sparrow',
    playerTwoName: 'sAIlor moon',
  };

  it('should initialize with correct gameSetup', () => {
    expect(app.gameSetup).toEqual(testGameSetup);
  });

  describe('changeSettings', () => {
    it('should change settings correctly', () => {
      app.changeSettings('mode', 'versus');
      expect(app.gameSetup.settings.mode).toBe('versus');

      app.changeSettings('difficulty', 'salvo');
      expect(app.gameSetup.settings.difficulty).toBe('salvo');
    });
  });

  it('isSalvoMode mode should return true when the mode is "salvo"', () => {
    expect(app.isSalvoMode()).toBe(true);
  });

  describe('playGame', () => {
    it('should set the player names correctly', () => {
      app.playGame('A', 'B');
      expect(app.gameSetup.playerOneName).toBe('A');
      expect(app.gameSetup.playerTwoName).toBe('B');
    });
  });
});
