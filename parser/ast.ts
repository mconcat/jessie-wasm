import { TokenKind } from './lexer.ts';
import * as parsec from 'typescript-parsec';

type Token = parsec.Token<TokenKind>;

export type DataLiteral =
  | NullLiteral
    BoolLiteral
  | NumberLiteral
  | StringLiteral

export interface NullLiteral {
  kind: 'NullLiteral';
}

export function applyNullLiteral(value: Token): DataLiteral {
  return { kind: 'NullLiteral' };
}

export interface BoolLiteral {
  kind: 'BoolLiteral';
  data: boolean;
}

export function applyBoolLiteral(value: Token): DataLiteral {
  return { kind: 'BoolLiteral', data: {"false": false, "true": true}[value.text] };
}

export interface NumberLiteral {
  kind: 'NumberLiteral';
  data: number;
}

export function applyNumberLiteral(value: Token): DataLiteral {
  return { kind: 'NumberLiteral', data: +value.text };
}

export interface StringLiteral {
  kind: 'StringLiteral';
  data: string;
}

export function applyStringLiteral(value: Token): DataLiteral {
  return { kind: 'StringLiteral', data: value.text }; // XXX: remove trailing "
}

// [ pureExpr ** , ]
export interface PureArray {
  kind: 'PureArray';
  data: PureExpr[];
}

export function applyPureArray(value: PureExpr[]): PureArray {
  return { kind: 'PureArray', data: value };
}

export interface Array {
  kind: 'Array';
  data: ArrayElement[];
}

export function applyArray(value: ArrayElement[]): Array {
  return { kind: 'Array', data: value };
}

export type ArrayElement =
  | AssignExpr
  | AssignExprWithEllipses

export interface PureRecord {
  kind: 'PureRecord';
  data: PurePropDef[];
}

export function applyPureRecord(value: PurePropDef[]): PureRecord {
  return { kind: 'PureRecord', data: value };
}


export interface Record {
  kind: 'Record';
  data: PropDef[];
}

export function applyRecord(value: PropDef[]): Record {
  return { kind: 'Record', data: value };
}


// XXX: purepropdef, propdef

export type AssignExpr =
  | PrimaryExpr

export interface AssignExprWithEllipses {
  kind: "AssignExprWithEllipses";
  data: AssignExpr;
}

export type PrimaryExpr =
  | DataStructure
//  | QuasiExpr // later
  | AssignExpr
  | UseVar

export type DataStructure =
  | Undefined
  | DataLiteral
  | Array
  | Record

export interface Undefined {
  kind: 'Undefined';
}

export function applyUndefined(value: Token): DataStructure {
  return { kind: 'Undefined' }
}

export type PureExpr =
  | DataLiteral
  | PureArray
  | PureRecord
  | UseVar

// Justin

export type MemberPostOp = 
  | UnaryExpr
  | GetMember

export interface GetMember {
  kind: 'GetMember';
  data: string;
}

export function applyGetMember(value: Token): MemberPostOp {
  return { kind: 'GetMember', data: value.text }
}

export interface UnaryExpr {
  kind: 'UnaryExpr';
  preops: PreOp[];
  data: CallExpr;
}

export function applyUnaryExpr(value: [Preop[], CallExpr]): UnaryExpr {
  return { kind: 'UnaryExpr', preops: value[0], data: value[1] }
}

export interface CallExpr {
  kind: 'CallExpr';
  data: PrimaryExpr;
  postops: CallPostOp[];
}

export function applyCallExpr(value: [PrimaryExpr, CallPostOp[]]): CallExpr {
  return { Kind: 'CallExpr', data: value[0], postops: value[1] }
} 

export type CallPostOp =
  | MemberPostOp
  | Args

export interface CondExpr {
  kind: 'CondExpr';
  ternary: [AssignExpr, AssignExpr][];
  data: OrElseExpr;
}

export function applyCondExpr(value: [OrElseExpr, [AssignExpr, AssignExpr][]]): CondExpr {
  return { kind: 'CondExpr', data: value[0], ternary: value[1] }
}

export interface BinaryExpr<Kind, BinOp, Child> {
  kind: Kind;
  data: Child;
  children: [BinOp, Child][]
}

export function applyBinaryExpr<Kind, BinOp, Child>(value: [Child, [BinOp, Child][]]): BinaryExpr<Kind, Binop, Child> {
  return { kind: Kind, data: value[0], children: value[1] }
}

export type OrElseExpr = BinaryExpr<'OrElseExpr', OrElseOp, AndThenExpr>
export type AndThenExpr = BinaryExpr<'AndThenExpr', AndThenOp, EagerExpr>
export type EagerExpr = BinaryExpr<'EagerExpr', EagerOp, ShiftExpr>;
export type ShiftExpr = BinaryExpr<'ShiftExpr', ShiftOp, AddExpr>;
export type AddExpr = BinaryExpr<'AddExpr', AddOp, MultExpr>;
export type MultExpr = BinaryExpr<'MultExpr', MultOp, PowExpr>;

export interface PowExpr {
  kind: 'PowExpr';
  bases: CallExpr[];
  exp: UnaryExpr;
}

export function applyPowExpr(value: [CallExpr[], UnaryExpr]): PowExpr {
  return { kind: 'PowExpr', bases: value[0], exp: value[1] }
}
