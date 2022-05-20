import { TokenKind } from './lexer';
import * as parsec from 'typescript-parsec';

type Token = parsec.Token<TokenKind>;

export type DataLiteral =
  | NullLiteral
  | BoolLiteral
  | NumberLiteral
  | StringLiteral

export interface NullLiteral {
  kind: 'NullLiteral';
}

export function applyNullLiteral(value: Token): DataLiteral {
  return { kind: 'NullLiteral' };
}

export interface BoolLiteral {
  kind: 'BooleanLiteral';
  data: boolean;
}

export function BooleanLiteral(value: boolean): BoolLiteral { return { kind: 'BooleanLiteral', data: value } }

export function applyBoolLiteral(value: Token): DataLiteral { return BooleanLiteral(value.text == 'true' ? true : false ) }

export interface NumberLiteral {
  kind: 'NumberLiteral';
  data: string; // using string for handling fixed point decimal and bigints
}

export function NumberLiteral(value: string): NumberLiteral { return { kind: 'NumberLiteral', data: value } }

export function applyNumberLiteral(value: Token): DataLiteral { return NumberLiteral(value.text) }

export interface StringLiteral {
  kind: 'StringLiteral';
  data: string;
}

export function StringLiteral(value: string): StringLiteral { return { kind: 'StringLiteral', data: value } }

export function applyStringLiteral(value: Token): DataLiteral { return StringLiteral(value.text.slice(1, -1)) } 

export interface Ident {
  kind: 'Ident';
  data: string,
}

export function Ident(data: string): Ident {
  return { kind: 'Ident', data }
}

export function applyIdent(value: Token): Ident {
  return { kind: 'Ident', data: value.text }
}

export function empty<Kind, Elem>(kind: Kind): {kind: Kind, data: Elem[]} {
  return { kind: kind, data: [] }
}

export function single<Kind, Elem>(kind: Kind) {
  return (value: Elem) => {
    return { kind: kind, data: [value] };
  }  
}

export function append<Kind, Elem>(kind: Kind) {
  return (arr: {kind: Kind, data: Elem[]}, value: Elem) => {
    return { kind: kind, data: arr.data.concat([value]) }
  }
}

export interface Array {
  kind: 'Array';
  data: Element[];
}

export function emptyArray(): Array {
  return { kind: 'Array', data: [] }
}

export function applyArrayElement(value: Element): Array {
  return { kind: 'Array', data: [value] };
}

export function appendArrayElement(arr: Array, value: Element): Array {
  return { kind: 'Array', data: arr.data.concat([value]) }
}

export type Element =
  | AssignExpr
  | AssignExprWithEllipses // spread notation. put in json instead of justin in sake of simplicity

export function applyElement(ellipsis: Token|undefined, expr: AssignExpr): Element {
  return ellipsis ? { kind: 'AssignExprWithEllipses', expr: expr } : expr
}

export interface Prop {
  kind: 'Prop';
  name: DataLiteral;
  expr: AssignExpr;
}

export type PropDef =
  | Prop
  | UseVar
  | AssignExprWithEllipses

export function applyPropDef(name: DataLiteral, expr?: AssignExpr): PropDef {
  return expr ? { kind: 'Prop', name, expr } : { kind: 'UseVar', name: (name as StringLiteral).data }
}

export interface Record {
  kind: 'Record';
  data: PropDef[];
}

export function emptyRecord(): Record {
  return { kind: 'Record', data: [] }
}

export function applyRecord(value: PropDef): Record {
  return { kind: 'Record', data: [value] };
}

export function appendRecord(arr: Record, value: PropDef): Record {
  return { kind: 'Record', data: arr.data.concat([value]) }
}


export interface Expr {
  expr: AssignExpr;
}

export interface AssignExpr {
  kind: 'AssignExpr';
  expr: PrimaryExpr; // | CondExpr...
}

export interface AssignExprWithEllipses {
  kind: "AssignExprWithEllipses";
  expr: AssignExpr;
}

export interface UseVar {
  kind: 'UseVar';
  name: string;
}

export type PrimaryExpr =
  | DataStructure
//  | QuasiExpr // later
  | Expr
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