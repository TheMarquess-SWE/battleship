export default class ScreenController {
  constructor() {
    this.playerOneNameInputEl = undefined;
    this.playerTwoNameInputEl = undefined;
    this.playerTwoInputContainerEL = undefined;
    this.gameSettingsFieldsetEl = undefined;
    this.optionChoiceEls = undefined;
    this.gameSetupFormEl = undefined;
    this.currentPlayerBoardEl = undefined;
    this.oponentPlayerBoardEl = undefined;
    this.currentPlayerCellEls = undefined;
    this.oponentPlayerCellEls = undefined;
    this.gameStatusHeaderEl = undefined;
    this.currentPlayerNameEl = undefined;
    this.oponentPlayerNameEl = undefined;
    this.attacksLeftHeaderEl = undefined;
    this.cellStatusClasses = [
      'cell-unexplored',
      'cell-missed-hit',
      'cell-hit-alive',
      'cell-hit-sunk',
    ];
  }

  init() {
    this.playerOneNameInputEl = document.getElementById(
      'player-one-name-input'
    );
    this.playerTwoNameInputEl = document.getElementById(
      'player-two-name-input'
    );
    this.playerTwoInputContainerEL = document.getElementById(
      'player-two-name-input-container'
    );
    this.gameSettingsFieldsetEl = document.getElementById(
      'game-settings-fieldset'
    );
    this.optionChoiceEls = document.querySelectorAll('.option-choice');
    this.gameSetupFormEl = document.getElementById('game-setup-form');
    this.currentPlayerBoardEl = document.getElementById(
      'current-player-gameboard'
    );
    this.oponentPlayerBoardEl = document.getElementById(
      'oponent-player-gameboard'
    );
    this.gameStatusHeaderEl = document.getElementById('game-status-header');
    this.currentPlayerNameEl = document.getElementById(
      'player-one-name-header'
    );
    this.oponentPlayerNameEl = document.getElementById(
      'player-two-name-header'
    );
    this.attacksLeftHeaderEl = document.getElementById('attacks-left-header');
  }

  bindStartGame(playGame) {
    this.gameSetupFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const playerOneName = this.playerOneNameInputEl.value;
      const playerTwoName = this.playerTwoNameInputEl.value;
      playGame(playerOneName, playerTwoName);
    });
  }

  bindGameSettings(changeSettings) {
    this.gameSettingsFieldsetEl.addEventListener('click', (e) => {
      const optionEl = e.target.closest('.option-choice') || null;
      if (!optionEl) return;
      changeSettings(optionEl.dataset.type, optionEl.dataset.value);
    });
  }

  bindBoardTargetCell(enqueueAttackPosition) {
    this.oponentPlayerBoardEl.addEventListener('click', (e) => {
      const cellEl = e.target.closest('.gameboard-cell') || null;
      if (!cellEl) return;
      cellEl.classList.add('cell-target');
      enqueueAttackPosition(Number(cellEl.dataset.index));
    });
  }

  initSettings(settings) {
    this.updateSettings(settings);
  }

  initPlayersBoards(gameSetup) {
    this.fillPlayersBoards(gameSetup.gameboardSize);

    this.currentPlayerCellEls =
      this.currentPlayerBoardEl.querySelectorAll('.gameboard-cell');
    this.oponentPlayerCellEls =
      this.oponentPlayerBoardEl.querySelectorAll('.gameboard-cell');

    this.updateCurrentPlayerName(gameSetup.playerOneName);
    this.updateOponentPlayerName(gameSetup.playerTwoName);
  }

  fillPlayersBoards(gameboardSize) {
    const cellWidth = this.currentPlayerBoardEl.offsetWidth / gameboardSize;

    for (let i = 0; i < gameboardSize ** 2; i += 1) {
      this.currentPlayerBoardEl.appendChild(this.createCellEl(i, cellWidth));
      this.oponentPlayerBoardEl.appendChild(this.createCellEl(i, cellWidth));
    }
  }

  createCellEl(index, width) {
    const el = Object.assign(document.createElement('div'), {
      className: 'gameboard-cell',
    });
    el.style.width = `${width}px`;
    el.dataset.index = index;
    return el;
  }

  updateSettings(settings) {
    this.playerTwoInputContainerEL.classList.add('hidden');
    this.optionChoiceEls.forEach((optionEl) =>
      optionEl.classList.remove('active-choice')
    );

    if (settings.mode === 'versus') {
      this.playerTwoInputContainerEL.classList.remove('hidden');
    }

    this.optionChoiceEls.forEach((optionEl) => {
      if (optionEl.dataset.value === settings[optionEl.dataset.type])
        optionEl.classList.add('active-choice');
    });
  }

  updateRound(currentPlayer, oponentPlayer) {
    const gameMessage = `${currentPlayer.name}, Attacks now!`;
    this.updateGameStatusHeader(gameMessage);
    this.updateCurrentPlayer(currentPlayer);
    this.updateOponentPlayer(oponentPlayer);
    this.updateAttacksLeftHeader(currentPlayer.getRoundTargetsLeft());
  }

  updateCurrentPlayer(currentPlayer) {
    this.updateCurrentPlayerName(currentPlayer.name);
    this.updateBoard(this.currentPlayerCellEls, currentPlayer.gameboard);
  }

  updateOponentPlayer(oponentPlayer) {
    this.updateOponentPlayerName(oponentPlayer.name);
    this.updateBoard(this.oponentPlayerCellEls, oponentPlayer.gameboard);
  }

  updateBoard(cellEls, gameboard) {
    cellEls.forEach((cellEl) => {
      const boardCell = gameboard.board[Number(cellEl.dataset.index)];
      cellEl.className = `gameboard-cell ${this.cellStatusClasses[boardCell.status]}`;
    });
  }

  updateCurrentPlayerName(currentPlayerName) {
    this.currentPlayerNameEl.textContent = `Your gameboard (${currentPlayerName})`;
  }

  updateGameStatusHeader(message) {
    this.gameStatusHeaderEl.textContent = message;
  }

  updateAttacksLeftHeader(attacksLeft) {
    this.attacksLeftHeaderEl.textContent = `${attacksLeft} attacks left`;
  }

  updateOponentPlayerName(oponentPlayerName) {
    this.oponentPlayerNameEl.textContent = `${oponentPlayerName}`;
  }

  updateGameEnd(players, winner) {
    const gameMessage = `${winner.name} wins!!!`;
    this.updateGameStatusHeader(gameMessage);
    this.updateCurrentPlayer(players[0]);
    this.updateOponentPlayer(players[1]);
  }

  markTargetCells(cellsIndex) {
    cellsIndex.forEach((index) => {
      this.oponentPlayerCellEls[index].classList.add('cell-target');
    });
  }
}
