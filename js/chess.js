function Game() {
    var squares = $('#board ul li'),
        selectedSquare = null,
        gameOver = false,
        cLabels = "ABCDEFGH";
    Game.turnCount = 1;
    Game.Players = [];
    Game.change = false;
    Game.castled = null;
	
    $('#resign').button().click(function() {
        endGame(1);
    });

    Game.Players.push(new Player('white'));
    Game.Players.push(new Player('black'));
    Game.Players[0].activate();
	
    $('#turn').html(Game.Players[0].name);
	
    $(squares).click(function(){validateSquare(this)});
	function validateSquare(square){
		jSquare = $(square);
		var kid = occupied(square.id);
        if (kid && kid.color == Game.Players[0].color) { // checks if piece belongs to the current player
            select(square);
            $(Legal(kid).moves).addClass('legal');
        }
        else if (jSquare.hasClass('legal')) { // If clicked square is a legal move
            piece = occupied(selectedSquare.id); // retrieve piece from the selected square
            piece.move(square);
            // If the last move did not result in check call the turn change. << B. Fisher
            if (Game.change) turn();
        }
        else {
            select(); // if square is not occupied, or is occupied by an opponent piece
        }			// that is not capturable than clear the selection
	}

    function turn() {
        select(false);
        $('.legal').removeClass('legal'); // clears legal moves of last moved piece
        $('.active').removeClass('active'); // Clear active status of previous players pieces << B. Fisher 5/6 1700
        // Find whether the last move placed the next player in check
        Game.Players[1].King.inCheck = (check(Game.Players[1].King.position, Game.Players[0]));
        //Clears the EP variables of the current players pawns << B. Fisher
        $(Game.Players[0].pawns).each(function() {
            this.EP = false;
        });
        Game.Players.reverse(); // Switches the active player
        Game.Players[0].activate();
        if (Game.Players[0].color == 'white') { //Each time both players have moved turnCount incriments <<B. Fisher
            Game.turnCount++;
        }
        Game.change = null;
        if (Checkmate()) endGame(2);
        if (Stalemate()) endGame(3);
        // Game didn't end, change name and color of dash
        $('#Dash').css('background', Game.Players[0].color);
        $('#turn').html(Game.Players[0].name);
        $('.threat').removeClass('threat');
    }

    function select(square) {
		/* Function to handle square selection.
		 * Previously selected squares are de-selected.
		 * If a square id is passed the square is given the selected class.
		 * If a falsey value is passed than the selectedSquare variable is cleared.
		 */
        $('.legal').removeClass('legal');
        $('.selected').removeClass('selected');
        $('.threat').removeClass('threat');
        if (square) {
            selectedSquare = square;
            $(selectedSquare).addClass('selected');
        }
        else { selectedSquare = null; }
    }

    function Checkmate(player) {
        //if players king is in check
        // if checking piece is vulnerable
        //if all available moves for the king are threatened
        return false;
    }

    function Stalemate() {
        // If king is not in check, put the current player has no legal moves return true. << B. Fisher
        var legalMoves = '';
        $.each(Game.Players[0].pieces, function() {
            legalMoves += Legal(this).moves;
        });
        $.each(Game.Players[0].pawns, function() {
            legalMoves += Legal(this).moves;
        });
        legalMoves += Legal(Game.Players[0].King).moves;
        //console.log('Stalemate moves: ' + legalMoves);
        if (legalMoves.length === 0 && !Game.Players[0].King.inCheck) return true;
        else return false;
    }

    function endGame(gameOver) {
        // End game alerts << B. Fisher
        switch (gameOver) {
            // If gameOver is 1 current player resigned
        case 1:
            alert(Game.Players[0].name + ' resigned on turn ' + Game.turnCount + '.');
            endGame();
            break;
            // If gameOver is 2 current player is mated.
        case 2:
            alert(Game.Players[0].name + ' was mated after ' + Game.turnCount + ' moves.');
            endGame();
            break;
        case 3:
            alert(Game.Players[0].name + ' is in Stalemate after ' + Game.turnCount + ' moves.');
            endGame();
            break;
            // If gameOver is false then proceed with next players turn.
        default:
            $('#Dash').css('background', Game.Players[0].color);
            $('#turn').html(Game.Players[0].name);
            //			$("#board img." + Game.Players[0].color).draggable("enable");
        }

        $('#cover').removeClass("hidden");
        $('#resign').button('disable');
    }
    // Log the player's move << J-M Glenn
    // Modified << B. Fisher 3/23 1830

    function logMove(piece, start, captured) {
        var row = $('<tr>'),
            cell, end = piece.position.toLowerCase(),
            moveType = (captured === null) ? " - " : " x ",
            pieceType = (piece.type != "knight") ? piece.type.toUpperCase().charAt(0) : "N",
            move;
        start = start.toLowerCase();
        $('#log').attr({
            scrollTop: $('#log').attr('scrollHeight')
        });
        if (piece.color == "white") {
            $(row).append('<td>').append('<td>').append('<td>').appendTo('#log tbody');
            $(row).children().first().text(Game.turnCount + '.');
            $(row).children().last().hide();
            cell = $(row).children()[1];
        }
        else {
            cell = $('#log tbody td:last');
            $(cell).show();
        }
        if (Game.castled == "king") move = '0-0';
        else if (Game.castled == "queen") {
            move = ('0-0-0');
        }
        else {
            pieceType = (pieceType != "P") ? pieceType : '';
            move = (pieceType + start + moveType + end);
        }
        // If a pawn is promoting store the cell where the move is logged to append with promotion info << B. Fisher
        if (piece.type == 'pawn' && piece.row() == piece.endRow) piece.logCell = cell;
        $(cell).text(move);
    }
    $('#board').data('game', this);
    // ===============================================

    function Player(side) {
        this.color = side;
        this.pieces = [];
        this.pawns = [];
        this.name = prompt(this.color[0].toUpperCase() + this.color.substr(1) + " side's name:", 'Player ' + ($(Game.Players).size() + 1));
        if (!this.name) this.name = 'Player ' + ($(Game.Players).size() + 1);
        var startRow = (this.color == 'white') ? 1 : 8,
            // White Player starts on Row 1, Black on row 8
            pawnRow = (this.color == 'white') ? 2 : 7; // Pawns start on the next medial row
        for (p = 0; p <= 7; p++) {
            this.pawns.push(new pawn(this.color, cLabels[p] + pawnRow));
        }
        this.pieces.push(new rook(this.color, "A" + startRow));
        this.pieces.push(new rook(this.color, "H" + startRow));
        this.pieces.push(new knight(this.color, "B" + startRow));
        this.pieces.push(new knight(this.color, "G" + startRow));
        this.pieces.push(new bishop(this.color, "C" + startRow));
        this.pieces.push(new bishop(this.color, "F" + startRow));
        this.pieces.push(new queen(this.color, "D" + startRow));
        this.King = new king(this.color, "E" + startRow);
        var self = this;
        this.kill = function() {
            var piece = callPiece(this),
                array, index;
            if (piece) array = (piece.type == 'pawn') ? self.pawns : self.pieces;
            index = $.inArray(piece, array);
            if (index > -1) array.splice(index, 1);
        };
        this.activate = function() {
            $(this.pawns).each(function() {
                $(this.image).addClass('active'); //Add active status to  pawns << B. Fisher 5/6 1700
            });
            $.each(this.pieces, function() {
                $(this.image).addClass('active'); //Add active status to pieces << B. Fisher 5/6 1700
            });
            //Add active status to King << B. Fisher 5/6 1700
            $(this.King.image).addClass('active');
        };
        //Remove a piece from this players piece array when captured << B. Fisher 3/3 2100
        // Revised to function with seperate pieces and pawns arrays << B. Fisher 3/14 2030
        $('#board img').bind('kill', self.kill);
    }
    //=======================================================

    function Piece(color, start) {
        this.moved = false;
        this.protection = false;
        this.position = start;
        this.color = color;
        this.col = function() {
            return this.position[0];
        };
        this.row = function() {
            return this.position[1] * 1;
        };
        this.image = $("<img>");
        $(this.image).attr({
            src: 'images/' + this + '_' + color + '.png',
            alt: color + ' ' + this
        }).addClass(color).data('piece', this); // Adds piece data to the images;
        var self = this;
        this.place = function(position) {
            $(this.image).appendTo("#" + position);
        };
        this.evalProtect = function() {
            var legal = Legal(this);
        };
        this._move = function(destination) {
            var occupant = occupied(destination.id),
                // Piece to be captured
                self = this,
                capturedPiece = null;
            // Store the occupant of the destination square.
            $(this.image).appendTo(destination);
            if (occupant) capturedPiece = occupant;
            else if (this.EP) capturedPiece = this.EP;
            // If a piece is captured, remove the piece
            if (capturedPiece) $(capturedPiece).remove();
            // Check to see if move results in check << B. Fisher 3/07 2030
            if (this.type != 'king' && check(Game.Players[0].King.position, Game.Players[1], capturedPiece)) {
                $('.legal').removeClass('legal');
                // Move it to the place of the piece it's capturing
                $(this.image).appendTo('#' + this.position);
                // Capturing would result in check, put the piece back and alert the player << B. Fisher
                if (capturedPiece)(capturedPiece.image).appendTo(capturedPiece.position);
                alert('Move results in check.');
                $('#' + this.position).removeClass('selected');
                Game.change = false;
            }
            else {
                // The move was valid, carry on with the capture
                var location = this.position;
                this.position = destination.id;
                this.moved = true;
                if (capturedPiece) capturedPiece.capture();
                Game.change = true;
                this.evalProtect();
                if (!(this.type == 'rook' && Game.castled)) logMove(this, location, capturedPiece);
            }
        };
		
        this.capture = function() {
            $(this.image).trigger('kill', this.image);
            $(this.image).remove();
			
            // Show captured piece in the prison << B. Fisher 3/11 1640
            var cell = $('#prison [rel="' + this.color + ' ' + this.type + '"]'),
            prisoner = $(cell).find('img');
			
			if ($(prisoner).hasClass('hidden')){
				$(prisoner).removeClass('hidden')
				.hide()
				.fadeIn('slow');
			};

            // If the count span is empty, insert '1' and hide it.
            // If it already contains a number, add 1 and show it. << B. Fisher <<3/11 1800
            var cellCount = $(cell).find('.count')[0],
                c = null;
            if ($(cellCount).html()) {
                c = $(cellCount).html();
                c++;
                $(cellCount).html(c).fadeIn('slow');
            }
            else $(cellCount).html(1).hide();
            return true;
        };
    }
	
    // Start piece definitions
    function pawn(color, start) {
        this.toString = function() {
            return 'pawn';
        };
        Piece.call(this, color, start);
        // inc variable indicates which direction is forward depending on color.
        // endRow variable is the promotion rank for the pawn << B. Fisher
        this.type = "pawn";
        this.EP = false;
        this.inc = (color == 'white') ? 1 : -1;
        this.promotion = null;
        this.logCell = null;
        this.endRow = (color == 'white') ? 8 : 1;
        var self = this;
        
        self.place(start);
    }
	pawn.prototype.footprint = function() {
		self = this;
        row = self.row();
        col = self.col();
        ids = [];
        if (!self.moved) ids.push(col + (row + 2 * this.inc));
        else ids.push(col + (row + 1 * this.inc));
        ids.push(cLabels[cLabels.indexOf(col) - 1] + (row + this.inc));
        ids.push(cLabels[cLabels.indexOf(col) + 1] + (row + this.inc));
        return ids;
	};
    pawn.prototype.move = function(destination) {
		self = this;
        // Evaluate whether pawn has passed an opponent pawn on opening double step << B. Fisher
        if (!this.moved && (destination.id.match(4) || destination.id.match(5))) {
            var prev = (this.col() == 'A') ? false : occupied(destination.previousElementSibling.id);
            var next = (this.col() == 'H') ? false : occupied(destination.nextElementSibling.id);
            if (prev && prev == 'pawn' && prev.color != self.color) prev.EP = this;
            if (next && next == 'pawn' && next.color != self.color) next.EP = this;
        }
        // Check if pawn is capturing en passant. EP variable will hold an opponent pawn that passed.
        // If opponent pawn and this pawn are not on the same column (position[0]) clear EP variable. << B. Fisher
        if (this.EP && this.EP.position[0] != destination.id[0]) this.EP = false;
        this._move(destination);
        if (this.row() == this.endRow) this.promote(destination);
	};
	
	// Pawn promotion functionality << B. Fisher 3/06
	pawn.prototype.promote = function(destination) {
		self = this;
        //Prompt for promotion preference << B. Fisher 3/29 1630
        var newPiece = prompt("Promote to a [q]ueen or a k[n]ight?");
        // Remove the pawn's image, and clear it from the Player's pieces array.
        $(self.image).remove();
        $(self).trigger('remove');
        // Place the promotion piece, add it to the pieces array and append the promotion
        // to the logged move. << B. Fisher 3/29 1630
        if (newPiece == 'n' || newPiece == 'knight' || newPiece == 'k') {
            Game.Players[0].pieces.push(new knight(this.color, destination.id));
            $(self.logCell).html($(self.logCell).html() + '=N');
        }
        else {
            Game.Players[0].pieces.push(new queen(this.color, destination.id));
            $(self.logCell).html($(self.logCell).html() + '=Q');
        }
    };
	pawn.prototype = new Piece();

    function rook(color, start) {
        this.toString = function() {
            return 'rook';
        };
        Piece.call(this, color, start);
        var self = this;
        this.type = "rook";
        this.move = function(destination) {
            this._move(destination);
        };
        this.footprint = function() {
            row = self.row();
            col = self.col();
            return ['A' + row, 'H' + row, col + 1, col + 8];
        };
        self.place(start);
    }
    rook.prototype = new Piece();

    function knight(color, start) {
        this.toString = function() {
            return 'knight';
        };
        Piece.call(this, color, start);
        var self = this;
        this.type = "knight";
        this.move = function(destination) {
            this._move(destination);
        };
        this.footprint = function() {
            var ids = [],
                col = cLabels.indexOf(self.col()),
                row = self.row(),
                cShift;
            for (var r = row - 2; r <= row + 2; r++) {
                if (r != row) {
                    cShift = (Math.abs(row - r) == 1) ? cShift = 2 : cShift = 1;
                    ids.push(cLabels[col + cShift] + r);
                    ids.push(cLabels[col - cShift] + r);
                }
            }
            return ids;
        };
        self.place(start);
    }
    knight.prototype = new Piece();

    function bishop(color, start) {
        this.toString = function() {
            return 'bishop';
        };
        Piece.call(this, color, start);
        var self = this;
        this.type = "bishop";
        this.move = function(destination) {
            this._move(destination);
        };
        this.footprint = function() {
            return [findDiagonal(this.position, 1, 1), findDiagonal(this.position, 1, -1), findDiagonal(this.position, -1, 1), findDiagonal(this.position, -1, -1)];
        };
        self.place(start);
    }
    bishop.prototype = new Piece();

    function queen(color, start) {
        this.toString = function() {
            return 'queen';
        };
        Piece.call(this, color, start);
        var self = this;
        this.type = "queen";
        this.move = function(destination) {
            this._move(destination);
        };
        this.footprint = function() {
            return ['A' + this.row(), 'H' + this.row(), this.col() + 1, this.col() + 8, findDiagonal(this.position, 1, 1), findDiagonal(this.position, 1, -1), findDiagonal(this.position, -1, 1), findDiagonal(this.position, -1, -1)];
        };
        self.place(start);
    }
    queen.prototype = new Piece();

    function king(color, start) {
        this.toString = function() {
            return 'king';
        };
        Piece.call(this, color, start);
        var self = this;
        this.type = "king";
        this.inCheck = false;
        this.move = function(destination) {
            // Evaluate if king is castling. << B. Fisher
            if (this.castle() && (destination.id.match('G') || destination.id.match('C'))) {
                // If king is moving to column 'G' (kingside) rook is on column 'H'
                if (destination.id.match('G')) {
                    var rook = callPiece($('#H' + this.row()).children('img')[0]),
                        dest = destination.previousElementSibling;
                    Game.castled = "king";
                    // If king is moving to column 'C' (queenside) rook is on column 'A'
                }
                else if (destination.id.match('C')) {
                    var rook = callPiece($('#A' + this.row()).children('img')[0]),
                        dest = destination.nextElementSibling;
                    Game.castled = "queen";
                }
                // Move the king, than move the rook to the king's other side (dest). << B. Fisher
                this._move(destination);
                $(rook.image).fadeOut('fast', function() {
                    rook.move(dest);
                    $(rook.image).fadeIn('fast');
                    // Reset the castled to false so black's moves will be logged << J-M Glenn
                    Game.castled = null;
                });
            }
            else this._move(destination);
        };
        this.castle = function() {
            if (this.inCheck || this.moved) return false;
            else return true;
        };
        this.footprint = function() {
            var row = this.row(),
                column = cLabels.indexOf(this.col()),
                square, squares = new Array();
            for (var c = column - 1; c <= column + 1; c++) {
                for (var r = row - 1; r <= row + 1; r++) {
                    square = cLabels[c] + r;
                    if (square != this.position) squares.push(square);
                };
            };
            return squares;
        };
        self.place(start);
    };
    king.prototype = new Piece();
    // End piece definitions
    //=======================================================
    // Returns array of the ids of squares where a piece can move

    function Legal(piece) {
        var footprint = piece.footprint(),
            color = piece.color,
            type = piece.type,
            position = piece.position,
            rNum = position[1] * 1,
            C = position[0],
            cNum = cLabels.indexOf(C) + 1,
            dest, orig, path, legalIDs = "";
        var legal = new Array();
        //	console.log(color + ' ' + type + ' - footprint: ' + footprint + ' | moved: ' + piece.moved);
        $(footprint).each(function() {
            if (inside(this, position)) {
                dest = occupied('#' + this);
                if (type == 'knight') {
                    // Knights are 'leapers'. They do not move along a vector 
                    // but jump to the destination square. << B. Fisher
                    if (dest.color == color) legal.push(dest);
                    else legalIDs += writeID(this[0], this[1]);
                }
                else if (type == 'pawn') {
                    // pawns cannot capture on their own column
                    if (dest && C != this[0]) {
                        if (dest.color == color) legal.push(dest);
                        else legalIDs += writeID(this[0], this[1]);
                    }
                    // Check for a pawn in EP and whether its column matches the move
                    else if (piece.EP && piece.EP.col() == this[0]) legalIDs += writeID(this[0], this[1]);
                    // add vertical moves
                    else if (C == this[0]) legalIDs += vector(position, this, color, false).list;
                }
                else {
                    path = vector(position, this, color, true);
                    legalIDs += path.list;
                    legal.push(path.end);
                };
            };
        });
        // King move legality.
        if (type == 'king') {
            // Check for castle legality and add king double step if true. << B. Fisher
            if (piece.castle()) {
                var rook = occupied('#H' + rNum);
                // Kingside castle squares are unoccupied and unthreatened, and the kingside rook has not moved.
                if (vector(position, 'G' + rNum, color, false).list.match('G') && rook && !rook.moved && !check('F' + rNum, Game.Players[1])) {
                    legalIDs += writeID('G', rNum);
                };
                // Queenside squares between rook and king are not occupied. The king is not moving across check.
                // and the queenside rook has not moved.
                var rook = occupied('#A' + rNum);
                if (vector(position, 'B' + rNum, color, false).list.match('B') && rook && !rook.moved && !check('D' + rNum, Game.Players[1])) {
                    legalIDs += writeID('C', rNum);
                };
            };
            // Removes any square ids from legalIDs that would move the king into check << B. Fisher 3.04 1700
            var squares = legalIDs.split(',');
            $('.threat').removeClass('threat');
            for (var i = squares.length - 2; i >= 0; i--) {
                if (check(squares[i], Game.Players[1])) {
                    $(squares[i]).addClass('threat');
                    squares.splice(i, 1);
                };
            };
            legalIDs = squares.join(',');
        };
        // === End King legality checks ===
        legal['moves'] = legalIDs;
        return legal;
    };
/* Function: vector
	 * Peramiters: start - the pieces location, end - the final square along the given path, side - current players color
	 * 				capture - whether opposing pieces can be captured on the last square,
	 * 				pin - if true pass the first opponent piece on the vector
	 * Returns: a string of comma seperated square ids for the requested vector, continuing to an occupied square
	 * 			if the square is occupied by an opponent piece the vector ids includes that square unless capture is false.
	 * Coded by: B. Fisher
	 */

    function vector(start, end, side, capture) {
        var sX = cLabels.indexOf(start[0]),
            eX = cLabels.indexOf(end[0]),
            sY = start[1] * 1,
            eY = end[1] * 1,
            xInc = findInc(sX, eX),
            yInc = findInc(sY, eY),
            squareList = '',
            dest, piece, square;
        do {
            sX += xInc;
            sY += yInc;
            square = cLabels[sX] + sY;
            dest = occupied('#' + square);
            if (dest) {
                if (capture && dest.color != side) squareList += '#' + square + ',';
                else if (dest.color == side) piece = dest;
                break;
            };
            squareList += '#' + square + ',';
        }
        while ((cLabels[sX] + sY) != end);
        return {
            list: squareList,
            end: piece
        };
    };
    // Checks the square ID for a occupying piece.
    // If one is found return the piece, if not return false. << B. Fisher

    function occupied(square_ID) {
        if (typeof(square_ID) != 'string') return false;
        if (square_ID.match('#') <= 0) square_ID = '#' + square_ID;
        var kid = $(square_ID).children('img');
        if (kid.length > 0) {
            kid = kid[0];
            return callPiece(kid);
        }
        else {
            return false;
        }
    };
    // Returns a properly formated CSS square ID (for jQuery selection)
    // unless the row and/or column are beyound the edge of the board. << B. Fisher

    function writeID(column, row) {
        try {
            if (!column) throw 0;
            else if (!row) throw 1;
            else if (row < 0) throw 2;
            else if (row > 8) throw 3;
        }
        catch (er) {
            if (er == 0) alert('Square ID Error: column is not defined');
            else if (er == 1) alert('Square ID Error: row is not defined');
            else if (er == 2) alert('Square ID Error: row is less than board index');
            else if (er == 3) alert('Square ID Error: row is greater than board index');
        }
        return '#' + column + row + ","
    };
    //Simple function to return a comparison between [first] and [second]
    // Returns: 1 if greater than, Returns: -1 if less than, Returns: 0 if equal << B. Fisher

    function findInc(first, second) {
        var Inc;
        if (first > second) {
            Inc = -1
        }
        else if (first < second) {
            Inc = 1
        }
        else {
            Inc = 0
        };
        return Inc;
    };
    // Returns: the ID of the farthest diagonal square on the board from [start] (requires ID, not object)
    // given X and Y increments << B. Fisher

    function findDiagonal(start, xInc, yInc) {
        var x = cLabels.indexOf(start[0]),
            y = start[1] * 1;
        do {
            x += xInc;
            y += yInc;
        }
        while (x > 0 && x < 7 && y > 1 && y < 8);
        if (x < 0 || x > 7 || y < 1 || y > 8) {
            return
        };
        return (cLabels[x] + y);
    };
    // Checks that square is valid and not equal to origin, and its coordinates are inside the board.
    // housekeeping function for Legal << B. Fisher

    function inside(square, origin) {
        if (square && origin != square && square[1] * 1 >= 1 && square.substr(1) * 1 <= 8 && cLabels.indexOf(square[0]) >= 0) return true;
        else return false;
    };
    // Returns: pieces that are threatening the square location (requires string in 'RC' format where R = row and C = column).
    // var ignore is an array of piece objects. It can be used to prevent recursion in the Legal object, helps in pinning checks.
    // If threatening pieces are found return an array of their objects, else returns false. << B. Fisher

    function check(square, player, ignore) {
        var chk = new Array(),
            ids, footprint;
        $(player.pieces).each(function() {
            if (this != ignore) {
                ids = Legal(this).moves;
                if (ids.length > 0 && ids.match(square)) chk.push(this);
            };
        });
        // Evaluate player's pawn capture squares. << B. Fisher 3/14 2130
        $(player.pawns).each(function() {
            var pawn = this;
            if (ignore != pawn) {
                ids = pawn.footprint();
                $(ids).each(function(index) {
                    if (this[0] == pawn.col()) ids.splice(index, 1);
                });
                if ($.inArray(ids, square.substring(1)) >= 0) {
                    chk.push(pawn);
                };
            };
        });
        ids = player.King.footprint();
        if ($.inArray(ids, square) >= 0) chk.push(player.King);
        if (chk.length < 1) chk = false;
        //	console.log('Player ' + player.color + ': ' + square + ' ' + chk);
        return chk;
    };

    function callPiece(image) {
        if (image) return $(image).data().piece;
    };
};