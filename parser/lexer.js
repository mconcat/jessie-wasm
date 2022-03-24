"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_parsec_1 = require("typescript-parsec");
var TokenKind;
(function (TokenKind) {
    // symbols
    TokenKind[TokenKind["LParen"] = 0] = "LParen";
    TokenKind[TokenKind["RParen"] = 1] = "RParen";
    TokenKind[TokenKind["LBrace"] = 2] = "LBrace";
    TokenKind[TokenKind["RBrace"] = 3] = "RBrace";
    TokenKind[TokenKind["LBracket"] = 4] = "LBracket";
    TokenKind[TokenKind["RBracket"] = 5] = "RBracket";
    TokenKind[TokenKind["Comma"] = 6] = "Comma";
    TokenKind[TokenKind["Colon"] = 7] = "Colon";
    // data literals
    TokenKind[TokenKind["Null"] = 8] = "Null";
    TokenKind[TokenKind["False"] = 9] = "False";
    TokenKind[TokenKind["True"] = 10] = "True";
    TokenKind[TokenKind["Number"] = 11] = "Number";
    TokenKind[TokenKind["String"] = 12] = "String";
    // Ops
    TokenKind[TokenKind["MulLevelOp"] = 13] = "MulLevelOp";
    TokenKind[TokenKind["AddLevelOp"] = 14] = "AddLevelOp";
    TokenKind[TokenKind["ShiftLevelOp"] = 15] = "ShiftLevelOp";
    TokenKind[TokenKind["RelLevelOp"] = 16] = "RelLevelOp";
    TokenKind[TokenKind["EqLevelOp"] = 17] = "EqLevelOp";
    TokenKind[TokenKind["BitLevelOp"] = 18] = "BitLevelOp";
    TokenKind[TokenKind["AndThenLevelOp"] = 19] = "AndThenLevelOp";
    TokenKind[TokenKind["OrElseLevelOp"] = 20] = "OrElseLevelOp";
    // Ident
    TokenKind[TokenKind["Ident"] = 21] = "Ident";
    // Predefined
    TokenKind[TokenKind["Const"] = 22] = "Const";
    TokenKind[TokenKind["Func"] = 23] = "Func";
    TokenKind[TokenKind["Let"] = 24] = "Let";
    TokenKind[TokenKind["Import"] = 25] = "Import";
    TokenKind[TokenKind["Export"] = 26] = "Export";
    TokenKind[TokenKind["Default"] = 27] = "Default";
    TokenKind[TokenKind["For"] = 28] = "For";
    TokenKind[TokenKind["Of"] = 29] = "Of";
    TokenKind[TokenKind["Switch"] = 30] = "Switch";
    TokenKind[TokenKind["SemiColon"] = 31] = "SemiColon";
    TokenKind[TokenKind["Space"] = 32] = "Space";
})(TokenKind || (TokenKind = {}));
const lexer = (0, typescript_parsec_1.buildLexer)([
    [true, /^\".*\"/g, TokenKind.String],
    [true, /^\d+(\.\d+)?/g, TokenKind.Number],
    [true, /^false/g, TokenKind.False],
    [true, /^true/g, TokenKind.True],
    [true, /^null/g, TokenKind.Null],
    [true, /^const/g, TokenKind.Const],
    [true, /^function/g, TokenKind.Func],
    [true, /^let/g, TokenKind.Let],
    [true, /^import/g, TokenKind.Import],
    [true, /^export/g, TokenKind.Export],
    [true, /^for/g, TokenKind.For],
    [true, /^of/g, TokenKind.Of],
    [true, /^switch/g, TokenKind.Switch],
    [true, /^(\*|\/|\%)/g, TokenKind.MulLevelOp],
    [true, /^(\+|\-)/g, TokenKind.AddLevelOp],
    [true, /^(\<\<|\>\>|\>\>\>)/g, TokenKind.ShiftLevelOp],
    [true, /^(\<\=|\<|\>|\>\=)/g, TokenKind.RelLevelOp],
    [true, /^(\=\=\=|\!\=\=)/g, TokenKind.EqLevelOp],
    [true, /^(\^|\&|\|)/g, TokenKind.BitLevelOp],
    [true, /^(\&\&)/g, TokenKind.AndThenLevelOp],
    [true, /^(\|\|)/g, TokenKind.OrElseLevelOp],
    [true, /^\(/g, TokenKind.LParen],
    [true, /^\)/g, TokenKind.RParen],
    [true, /^\{/g, TokenKind.LBrace],
    [true, /^\}/g, TokenKind.RBrace],
    [true, /^\[/g, TokenKind.LBracket],
    [true, /^\]/g, TokenKind.RBracket],
    [true, /^\,/g, TokenKind.Comma],
    [true, /^\:/g, TokenKind.Colon],
    [true, /^\;/g, TokenKind.SemiColon],
    [false, /^\s+/g, TokenKind.Space],
]);
exports.default = lexer;
