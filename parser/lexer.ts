import { buildLexer } from 'typescript-parsec';

export enum TokenKind {
  // symbols
  LParen,
  RParen,
  LBrace,
  RBrace,
  LBracket,
  RBracket,
  Comma,
  Colon,
  Dot,
  Ellipsis,
  Question,
  Starstar,

  // data literals
  Null,
  False,
  True,
  Number,
  String,

  // Ops
  MulLevelOp, // Mul, Div, Mod
  AddLevelOp, // Add, Sub,
  ShiftLevelOp,
  RelLevelOp, 
  EqLevelOp,
  BitLevelOp,
  AndThenLevelOp,
  OrElseLevelOp,

  // Ident
  Ident,

  // Predefined
  Const,
  Func,
  Let,
  Import,
  Export,
  Default,
  For,
  Of,
  Switch,

  Case,
  Catch,
  Continue,
  Else,
  Finally,
  If,
  Return,
  Throw,
  Try,
  Void,
  While,
  Undefined,

  SemiColon,

  Space
}

export const lexer = buildLexer([
  [true, /^(\".*\"|\'.*\')/g, TokenKind.String],
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
  [true, /^undefined/g, TokenKind.Undefined],

  [true, /^(\*|\/|\%)/g, TokenKind.MulLevelOp],
  [true, /^(\+|\-)/g, TokenKind.AddLevelOp],
  [true, /^(\<\<|\>\>|\>\>\>)/g, TokenKind.ShiftLevelOp],
  [true, /^(\<\=|\<|\>|\>\=)/g, TokenKind.RelLevelOp],
  [true, /^(\=\=\=|\!\=\=)/g, TokenKind.EqLevelOp],
  [true, /^(\^|\&|\|)/g, TokenKind.BitLevelOp],
  [true, /^(\&\&)/g, TokenKind.AndThenLevelOp],
  [true, /^(\|\|)/g, TokenKind.OrElseLevelOp],

  [true, /^\./g, TokenKind.Dot],
  [true, /^\.\.\./g, TokenKind.Ellipsis],
  [true, /^\?/g, TokenKind.Question],
  [true, /^\*\*/g, TokenKind.Starstar],

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
])

export default lexer
