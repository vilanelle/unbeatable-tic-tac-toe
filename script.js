$(document).ready(function() {
	// $(".board").hide(0).delay(100).fadeIn(1000);
	// $(".btn-row").hide(0).delay(800).fadeIn(1000);

	var multi = false;
	var board = [
		[' ', ' ', ' '],
		[' ', ' ', ' '],
		[' ', ' ', ' ']
	];

	getBoardState();
	var bState = JSON.parse(JSON.stringify(board));

	// select mode multiplayer or versus AI
	$('#btn-multi').on('click', multiOn);
	$('#btn-ai-human').on('click', aiHumanOn);


	// multiplayer mode
	var player1 = null;
	var player2 = null;
	var multiCurrPlayer = null;

	// single-player mode
	var aiPlayer = null;
	var humanPlayer = null;

	// choose ai/human player token
	$('#btn-x').click(function() {
		if (!multi) {
			humanPlayer = 'x';
			aiPlayer = 'o';
			$(".btn-row").css('opacity', '0.5');
		}
	});

	$('#btn-o').click(function() {
		if (!multi) {
			humanPlayer = 'o';
			aiPlayer = 'x';
			$(".btn-row").css('opacity', '0.5');
		}
	});

	// game
	$('[data-loc]').click(function() {
		if (!multi) {
			if (humanPlayer === null) {
				return;
			}
			if ($(this).text() === ' ') {
				$(this).text(humanPlayer);
				getBoardState();
				bState = (JSON.parse(JSON.stringify(board)));
				if (isGameOver(bState)) {
					markWin();
					setTimeout(resetGame, 1000);
				} else {
					setTimeout(aiMove, 200);
				}
			}
		} else { //multiplayer mode
			if (player1 === null || player2 === null) {
				return;
			}
			if ($(this).text() === ' ') {
				$(this).text(multiCurrPlayer);
				getBoardState();
				bState = (JSON.parse(JSON.stringify(board)));
				if (isGameOver(bState)) {
					markWin();
					setTimeout(resetGame, 1000);
				} else {
					if (multiCurrPlayer === 'x') {
						multiCurrPlayer = 'o';
					} else {
						multiCurrPlayer = 'x';
					}
				}
			}
		}
	});


	// FUNCTIONS
	// ai move
	var currPlayer;

	function aiMove() {
		currPlayer = aiPlayer;
		findBestMove(bState, currPlayer, depth);
		$('[data-loc="{i : ' + moveFound.h + ', j : ' + moveFound.v + '}"]').text(aiPlayer);
		getBoardState();
		bState = (JSON.parse(JSON.stringify(board)));
		clearWinCombo();
		if (isGameOver(bState)) {
			markWin();
			setTimeout(resetGame, 1000);
		}
	}

	// mark win
	function markWin() {
		for (var k = 0; k < winCombo.length; k++) {
			$('[data-loc="{i : ' + winCombo[k][0] + ', j : ' + winCombo[k][1] + '}"]').css('color', 'red');
		}
	}

	// unmark win
	function unmarkWin() {
		for (var k = 0; k < winCombo.length; k++) {
			$('[data-loc="{i : ' + winCombo[k][0] + ', j : ' + winCombo[k][1] + '}"]').css('color', 'black');
		}
	}
	// check if game over
	function isGameOver(b) {
		if (whoWins(b) === 'x' || whoWins(b) === 'o' || !isMovesLeft(b)) {
			return true;
		} else {
			return false;
		}
	}

	function clearBoard() {
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				$('[data-loc="{i : ' + i + ', j : ' + j + '}"]').text(' ');
			}
		}
	}

	function resetGame() {
		clearBoard();
		unmarkWin();
		clearWinCombo();
		getBoardState();
		bState = JSON.parse(JSON.stringify(board));
		aiPlayer = null;
		humanPlayer = null;
		multi = false;
		$(".btn-row").fadeOut('fast');
		$('#btn-ai-human').css('opacity', '1');
		$('#btn-ai-human').on('click', aiHumanOn);
		$('#btn-multi').css('opacity', '1');
		$('#btn-multi').on('click', multiOn);
		$('#btn-multi').removeClass('btn-on');
		$('#btn-ai-human').removeClass('btn-on');
	}

	// get best move for ai player
	var move;
	var moveFound;
	var depth = 0;

	function findBestMove(currBoard, player, d) {

		var winner = whoWins(currBoard);
		var movesLeft = isMovesLeft(currBoard);
		if (winner === 'x') {
			return 10 - d;
		} else if (winner === 'o') {
			return -10 + d;
		} else if (movesLeft === false) {
			return 0;
		} else {
			var bCopy = JSON.parse(JSON.stringify(currBoard));
			var scores = [];

			for (var i = 0; i < 3; i++) {
				for (var j = 0; j < 3; j++) {
					if (bCopy[i][j] === ' ') {
						bCopy[i][j] = player;
						scores.push(move = {
							h: i,
							v: j,
							score: findBestMove(bCopy, swapPlayer(player), d + 1)
						});
						bCopy[i][j] = ' ';
					}
				}
			}
			var bestMove;
			if (player === 'x') {
				var bestScore = -99;
				for (var i = 0; i < scores.length; i++) {
					if (scores[i].score > bestScore) {
						bestScore = scores[i].score;
						bestMove = {
							h: scores[i].h,
							v: scores[i].v
						}
					}
				}
			} else {
				var bestScore = 99;
				for (var i = 0; i < scores.length; i++) {
					if (scores[i].score < bestScore) {
						bestScore = scores[i].score;
						bestMove = {
							h: scores[i].h,
							v: scores[i].v
						}
					}
				}
			}
			bCopy[bestMove.h][bestMove.v] = player;
			moveFound = bestMove;
			return bestScore;
		}
	}
	// check current state of board
	function getBoardState() {
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				board[i][j] = $('[data-loc="{i : ' + i + ', j : ' + j + '}"]').text();
			}
		}
	}

	// swap player
	function swapPlayer(p) {
		if (p === 'x') {
			return 'o';
		} else {
			return 'x';
		}
	}
	//check if any moves left
	function isMovesLeft(b) {
		var ml = 0;
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				if (b[i][j] === " ") {
					ml++;
				}
			}
		}
		if (ml > 0) {
			return true;
		} else {
			return false;
		}
	}

	var winCombo = [];

	function clearWinCombo() {
		winCombo.length = 0;
	}

	// check for win
	function whoWins(b) {
		// horizontal
		for (var i = 0; i < 3; i++) {
			if (b[i][0] !== " " && b[i][0] === b[i][1] && b[i][1] === b[i][2]) {
				winCombo.push([i, 0], [i, 1], [i, 2]);
				return b[i][0];
			}
		}
		// vertical
		for (var j = 0; j < 3; j++) {
			if (b[0][j] !== " " && b[0][j] === b[1][j] && b[1][j] === b[2][j]) {
				winCombo.push([0, j], [1, j], [2, j]);
				return b[0][j];
			}
		}
		// diagonal 1
		if (b[0][0] !== " " && b[0][0] === b[1][1] && b[1][1] === b[2][2]) {
			winCombo.push([0, 0], [1, 1], [2, 2]);
			return b[0][0];
		}
		// diagonal 2
		if (b[0][2] !== " " && b[0][2] === b[1][1] && b[1][1] === b[2][0]) {
			winCombo.push([0, 2], [1, 1], [2, 0]);
			return b[0][2];
		}

	}

	function aiHumanOn() {
		multi = false;
		$('#btn-ai-human').addClass('btn-on');
		$('#btn-multi').css('opacity', '0.5 ');
		$('#btn-multi').off('click', multiOn);
		setTimeout(function() {
			$('.btn-row').fadeIn('fast');
		}, 100);
		setTimeout(function() {
			$('html, body').animate({
				scrollTop: $(".board").offset().top
			}, 900);
		});
	}

	function multiOn() {
		$('#btn-multi').addClass('btn-on');
		if (multi === false) {
			multi = true;
			$('#btn-ai-human').css('opacity', '0.5 ');
			$('#btn-ai-human').off('click', aiHumanOn);
			player1 = 'x';
			player2 = 'o';
			multiCurrPlayer = 'x';
		}
	}

});
