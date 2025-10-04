import GameController from './GameController';

describe('GameController', () => {
  it('should exist', () => {
    expect(GameController).toBeDefined();
  });

  describe('game setup', () => {
    const gameController = new GameController({
      gameboardSize: 10,
      numberOfShips: 5,
      settings: {
        mode: 'versus',
        difficulty: 'salvo',
      },
      playerOneName: 'PLAYER ONE',
      playerTwoName: 'PLAYER TWO',
    });

    it('should assing the player names correctly', () => {
      expect(gameController.players[0].name).toBe('PLAYER ONE');
      expect(gameController.players[1].name).toBe('PLAYER TWO');
    });

    it('should create the gameboards with the correct size and # of ships', () => {
      expect(gameController.players[0].gameboard.size).toBe(100);
      expect(gameController.players[0].shipsAlive()).toBe(5);
    });
  });

  describe('GameController methods in normal mode', () => {
    let gameController;

    beforeEach(() => {
      gameController = new GameController({
        gameboardSize: 10,
        numberOfShips: 5,
        settings: {
          mode: 'versus',
          difficulty: 'normal',
        },
        playerOneName: 'JUDO MASTER',
        playerTwoName: 'ALBEDO',
      });

      const testShipPositions = [
        [0, 1, 2, 3, 4],
        [10, 11, 12, 13],
        [20, 21, 22],
        [30, 31, 32],
        [40, 41],
      ];

      gameController.players[0].placeShips(testShipPositions);
      gameController.players[1].placeShips(testShipPositions);
    });

    describe('player turns', () => {
      it('should start with player one', () => {
        gameController = new GameController({
          gameboardSize: 10,
          numberOfShips: 5,
          settings: {
            mode: 'versus',
            difficulty: 'salvo',
          },
          playerOneName: 'JUDO MASTER',
          playerTwoName: 'ALBEDO',
        });
        expect(gameController.getCurrentPlayer()).toBe(
          gameController.players[0]
        );
      });

      it('should switch turns after a move', () => {
        gameController.attack([0]);
        expect(gameController.getCurrentPlayer()).toEqual(
          gameController.players[1]
        );
      });
    });

    describe('attacks', () => {
      it('should register hits correctly', () => {
        gameController.attack([0]);
        expect(
          gameController.getCurrentPlayer().gameboard.board[0].status
        ).toBe(2);
      });

      it('should register misses correctly', () => {
        gameController.attack([50]);
        expect(
          gameController.getCurrentPlayer().gameboard.board[50].status
        ).toBe(1);
      });
    });

    describe('winner selection', () => {
      it('should declare a winner when all of a player ships are sunk', () => {
        gameController.players[1].gameboard.sinkAllShips();
        gameController.attack([99]);

        expect(gameController.getWinner()).toBe(gameController.players[0]);
      });
    });
  });

  describe('GameController methods in salvo mode', () => {
    let gameController;

    beforeEach(() => {
      gameController = new GameController({
        gameboardSize: 10,
        numberOfShips: 5,
        settings: {
          mode: 'versus',
          difficulty: 'salvo',
        },
        playerOneName: 'JUDO MASTER',
        playerTwoName: 'ALBEDO',
      });

      const testShipPositions = [
        [0, 1, 2, 3, 4],
        [10, 11, 12, 13],
        [20, 21, 22],
        [30, 31, 32],
        [40, 41],
      ];

      gameController.players[0].placeShips(testShipPositions);
      gameController.players[1].placeShips(testShipPositions);
    });

    it('salvoMode should be true', () => {
      expect(gameController.salvoMode).toBe(true);
    });

    describe('number of attacks left', () => {
      it('should start with 5 attacks', () => {
        expect(gameController.players[0].getAttacksLeft()).toBe(5);
      });

      it('should have 2 attacks left when 3 ships have been sunk', () => {
        gameController.players[0].gameboard.sinkShip(0);
        gameController.players[0].gameboard.sinkShip(1);
        gameController.players[0].gameboard.sinkShip(2);

        expect(gameController.players[0].getAttacksLeft()).toBe(2);
      });

      it('should have 1 attack left when 4 ships have been sunk', () => {
        gameController.players[0].gameboard.sinkShip(0);
        gameController.players[0].gameboard.sinkShip(1);
        gameController.players[0].gameboard.sinkShip(2);
        gameController.players[0].gameboard.sinkShip(3);

        expect(gameController.players[0].getAttacksLeft()).toBe(1);
      });
    });

    describe('attacks', () => {
      it('should register single hit correctly when 1 attack left', () => {
        gameController.players[0].gameboard.sinkShip(1);
        gameController.players[0].gameboard.sinkShip(2);
        gameController.players[0].gameboard.sinkShip(3);
        gameController.players[0].gameboard.sinkShip(4);

        gameController.attack([0]);

        expect(
          gameController.getCurrentPlayer().gameboard.board[0].status
        ).toBe(2);
      });

      it('should register single miss correctly when 1 attack left', () => {
        gameController.players[0].gameboard.sinkShip(1);
        gameController.players[0].gameboard.sinkShip(2);
        gameController.players[0].gameboard.sinkShip(3);
        gameController.players[0].gameboard.sinkShip(4);

        gameController.attack([50]);

        expect(
          gameController.getCurrentPlayer().gameboard.board[50].status
        ).toBe(1);
      });

      it('should register multiple hits correctly when 5 attack left', () => {
        const attackPositionns = [0, 1, 2, 3, 4];
        gameController.attack(attackPositionns);

        attackPositionns.forEach((position) => {
          expect(
            gameController.getCurrentPlayer().gameboard.board[position].status
          ).toBe(3);
        });
      });

      it('should register multiple misses correctly when 5 attack left', () => {
        const attackPositionns = [50, 51, 52, 53, 54];
        gameController.attack(attackPositionns);

        attackPositionns.forEach((position) => {
          expect(
            gameController.getCurrentPlayer().gameboard.board[position].status
          ).toBe(1);
        });
      });
    });

    describe('queueAttack', () => {
      it('should register one enqueued attack in currentPlayer.attacksQueue', () => {
        const enqueuedAttack = 0;
        gameController.queueAttack(enqueuedAttack);
        expect(gameController.getCurrentPlayer().attacksQueue.length).toBe(1);
        expect(gameController.getCurrentPlayer().attacksQueue[0]).toBe(
          enqueuedAttack
        );
      });

      it('should place the attacks when the queue length reaches the Player.getAttacksLeft for this round', () => {
        const queueAttackPositions = [50, 51, 52, 53, 54];

        queueAttackPositions.forEach((position) =>
          gameController.queueAttack(position)
        );

        queueAttackPositions.forEach((position) => {
          expect(
            gameController.getCurrentPlayer().gameboard.board[position].status
          ).toBe(1);
        });
      });
    });
  });
});
