import { TokenKind } from './lexer';
import * as json from './json_ast'
import * as parsec from 'typescript-parsec';

// Justin

type Token = parsec.Token<TokenKind>;

export type MemberPostOp = 
  | UnaryExpr // Indexing, array[index]
  | GetMember // Member, struct.field

export interface GetMember {
  kind: 'GetMember';
  data: string;
}

export function applyGetMember(value: Token): MemberPostOp {
  return { kind: 'GetMember', data: value.text }
}

export type PreOp = 'VoidOp' | 'TypeofOp' | 'PositiveOp' | 'NegativeOp' | 'TildeOp' | 'BangOp'

export interface UnaryExpr {
  kind: 'UnaryExpr';
  preops: PreOp[];
  data: CallExpr;
}

export function applyUnaryExpr(value: [PreOp[], CallExpr]): UnaryExpr {
  return { kind: 'UnaryExpr', preops: value[0], data: value[1] }
}

export interface CallExpr {
  kind: 'CallExpr';
  data: json.PrimaryExpr;
  postops: CallPostOp[];
}

export function applyCallExpr(value: [json.PrimaryExpr, CallPostOp[]]): CallExpr {
  return { kind: 'CallExpr', data: value[0], postops: value[1] }
} 

export type CallPostOp =
  | MemberPostOp
  | json.AssignExprWithEllipses[] // function call, function(args...)
 
export function applyCallPostOp(exprs: [Token|undefined, json.AssignExpr][]): CallPostOp {
  return exprs.map((expr) => expr[0] ? { kind: 'AssignExprWithEllipses', expr: expr[1] } : expr[1])
}

export interface CondExpr {
  kind: 'CondExpr';
  ternary: [json.AssignExpr, json.AssignExpr][];
  data: OrElseExpr;
}

export function applyCondExpr(value: [OrElseExpr, [json.AssignExpr, json.AssignExpr][]]): CondExpr {
  return { kind: 'CondExpr', data: value[0], ternary: value[1] }
}

export interface BinaryExpr<Kind, BinOp, Child> {
  kind: Kind;
  data: Child;
  children: [BinOp, Child][]
}

export function single<Kind, BinOp, Child>(kind: Kind) {
  return (child: Child) => {
    return {kind: kind, data: child, children: []} as BinaryExpr<Kind, BinOp, Child> 
  }  
}

export function append<Kind, BinOp, Child>(kind: Kind) {
  return (expr: BinaryExpr<Kind, BinOp, Child>, child: [BinOp, Child]) => {
    return { kind: kind, data: expr.data, children: expr.children.concat([child]) } as BinaryExpr<Kind, BinOp, Child>
  }
}

export type OrElseExpr = BinaryExpr<'OrElseExpr', 'OrElseOp', AndThenExpr>
export type AndThenExpr = BinaryExpr<'AndThenExpr', 'AndThenOp', EagerExpr>

export type RelOp = 'LessEqualOp' | 'LessOp' | 'GreaterEqualOp' | 'GreaterOp'
export function applyRelOp(value: Token): RelOp|undefined {
  switch (value.text) {
  case "<=": return 'LessEqualOp'
  case "<": return 'LessOp'
  case ">": return 'GreaterOp'
  case ">=": return "GreaterEqualOp"
  }
}

export type EqOp = 'EqualOp' | 'NotEqualOp'
export function applyEqOp(value: Token): EqOp|undefined {
  switch (value.text) {
  case "===": return 'EqualOp'
  case "!==": return 'NotEqualOp'
  }
}
export type BitOp = 'BitAndOp' | 'BitXorOp' | 'BitOrOp'
export function applyBitOp(value: Token): BitOp|undefined {
  switch (value.text) {
  case "&": return 'BitAndOp'
  case "|": return 'BitOrOp'
  case "^": return 'BitXorOp'
  }
}
export type EagerOp =
  | RelOp
  | EqOp
  | BitOp
  | undefined

export type EagerExpr = BinaryExpr<'EagerExpr', EagerOp, ShiftExpr>;

export type ShiftOp = 'LeftShiftOp' | 'RightShiftOp' | 'UnsignedRightShiftOp' | undefined
export type ShiftExpr = BinaryExpr<'ShiftExpr', ShiftOp, AddExpr>;
export function applyShiftOp(value: Token): ShiftOp|undefined {
  switch (value.text) {
  case "<<": return 'LeftShiftOp'
  case ">>": return 'RightShiftOp'
  case ">>>": return 'UnsignedRightShiftOp' // TODO: check
  }
}

export type AddOp = 'AddOp' | 'SubOp' | undefined
export type AddExpr = BinaryExpr<'AddExpr', AddOp, MultExpr>;
export function applyAddOp(value: Token): AddOp|undefined {
  switch (value.text) {
  case "+": return 'AddOp'
  case "-": return 'SubOp'
  }
}

export type MultOp = 'MultOp' | 'DivOp' | 'ModOp' | undefined
export type MultExpr = BinaryExpr<'MultExpr', MultOp, PowExpr>;
export function applyMultOp(value: Token): MultOp|undefined {
  switch (value.text) {
  case "*": return 'MultOp'
  case "/": return 'DivOp'
  case "%": return 'ModOp'
  }
}

export interface PowExpr {
  kind: 'PowExpr';
  bases: CallExpr[];
  exp: UnaryExpr;
}

export function applyPowExpr(value: [CallExpr[], UnaryExpr]): PowExpr {
  return { kind: 'PowExpr', bases: value[0], exp: value[1] }
}
