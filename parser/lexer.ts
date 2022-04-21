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
  Bool,
  Number,
  String,

  Undefined,

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

  Keyword,
  Reserved,
  FutureReserved,

  SemiColon,

  Space
}

export const lexer = buildLexer([
  [true, /^('([^']|\\.)*'|"([^"]|\\.)*")/, TokenKind.String], // TODO: escape
  [true, /^[\+\-]?\d+(\.\d+|n)?/g, TokenKind.Number], // either integer, decimal, or bigint. decimals are considered as bigints.
  [true, /^(false|true)/g, TokenKind.Bool],
  [true, /^null/g, TokenKind.Null],
  [true, /^undefined/g, TokenKind.Undefined],

  [true, /^(break|case|catch|const|continue|debugger|default|else|export|finally|for|function|if|import|return|switch|throw|try|typeof|void|while)/g, TokenKind.Keyword],
  [true, /^(class|delete|do|extends|instanceof|in|new|super|this|var|with|yield)/g, TokenKind.Reserved],
  [true, /^(await|enum|implements|package|protected|interface|private|public)/g, TokenKind.FutureReserved],

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

  [true, /^[a-zA-Z_][a-zA-Z0-9_]*/g, TokenKind.Ident],

  [false, /^\s+/g, TokenKind.Space],
])

export default lexer
