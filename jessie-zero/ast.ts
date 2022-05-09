import { GeneratePrimeOptionsArrayBuffer } from 'crypto';
import * as json from '../parser/json_ast';
import * as justin from '../parser/justin_ast';
import * as jessie from '../parser/jessie_ast';
import * as typing from './typing'

// Intermediate form is untyped, sugar-free syntax
// Directly compiled into wasm.

// DataLiteral
// t.const
export type DataLiteral = json.DataLiteral
export type NullLiteral = json.NullLiteral // ref.null
export type BoolLiteral = json.BoolLiteral
export type NumberLiteral = json.NumberLiteral
export type StringLiteral = json.StringLiteral
export type Undefined = json.Undefined
export type DataStructure = 
    | json.Undefined
    | json.DataLiteral
    | Array
    | Record

export interface Array {
    kind: 'Array'
    data: [Expr, boolean][]
}

export interface Record {
    kind: 'Record'
    data: [string, Expr, boolean][]
}

// Identifier
export type Ident = json.Ident

// Composed types
//export type Array = json.Array
//export type Element = json.Element

// Record Pattern
// let {a: x, b=3, c, ...d} = s
// =>
// let x = s.a
// let b = x.b ? x.b : 3
// let c = s.c
// don't support spread notation for object for now

// Array Pattern
// let [a, b=3, {c}, ...d] = arr
// =>
// let a = arr[0]
// let b = arr[1] ? arr[1] : 3
// let c = (syntax expand on arr[2])
// let d = arr[3:]

// Top level expression, untyped
export type Expr = 
    // Declaration
    | Declaration
    // DataLiteral / Arithmetic
    | DataStructure // literal 
    | BinaryExpr 
    | UnaryExpr 
    // Assignment / Statements
    | AssignExpr 
    | Statement
    // Function / Complex Types
    | Closure // literal
    | CallExpr // function call
    | PropertyExpr // property acces
    | IndexExpr // array indexing
    // Module 
    // | Import // TODO
    | Export
    // Type annotated
    | Annotated

// export type AssignExpr = json.AssignExpr
// export type PrimaryExpr = json.PrimaryExpr

export interface Declaration {
    kind: 'Declaration';
    op: jessie.DeclOp;
    var: Ident;
    expr?: Expr;
}

// Arithmetic Operations
export type BinaryOp = 
    | justin.OrElseOp
    | justin.AndThenOp
    | justin.RelOp
    | justin.EqOp
    | justin.BitOp
    | justin.ShiftOp
    | justin.AddOp
    | justin.MultOp
    | 'PowOp'

// we use i32 specifically for denoting boolean results.
// all integer datatypes are i64.
// i64.eqz
// i64.eq
// i64.ne
// i64.{lt, le, gt, ge}_{s, u}

// i64.{add, sub, mul, div, rem}
// i64.{and, or, xor, shl, shr, rotl, rotr}

export interface BinaryExpr {
    kind: 'BinaryExpr';
    op: BinaryOp
    left: Expr;
    right: Expr;
}

// i64.{clz, ctx, popcnt}
// i32.wrap_i64(i64 -> bool)
// i64.extend_i32_{s, u}(bool -> i64)
// i64.extend_{8, 16, 32}_s{extend memory data into stack data}
export interface UnaryExpr {
    kind: 'UnaryExpr';
    op: justin.PreOp;
    expr: Expr;
}

export interface AssignExpr {
    kind: 'AssignExpr';
    left: LValue;
    right: Expr;
}

export interface LValue {
    kind: 'LValue';
    var?: Ident;
    index?: [Expr, Expr];
    property?: [Expr, Ident];
}

export interface Closure {
    kind: 'Closure';
    name?: Ident;
    // capture: Ident[];
    args: Ident[];
    body: Block; 
}

export interface CallExpr {
    kind: 'CallExpr';
    callee: Expr;
    args: Expr[];
}

export interface PropertyExpr {
    kind: 'PropertyExpr';
    callee: Expr;
    property: Ident;
}

export interface IndexExpr {
    kind: 'IndexExpr';
    callee: Expr;
    index: Expr;
}

export type Statement = 
    | Block
    | IfThenElse
    | TryCatch
    | While
    | Terminator

export interface Block {
    kind: 'Block';
    exprs: Expr[];
}

export interface IfThenElse {
    kind: 'IfThenElse';
    cond: Expr;
    then: Block;
    else: Expr;
}

export interface TryCatch {
    kind: 'TryCatch';
    body: Expr;
    catcher: Block;
    finalizer: Block;
}

export interface While {
    kind: 'While';
    cond?: Expr;
    body: Block;
}

export type Terminator = jessie.Terminator

export interface Export {
    kind: 'Export';
    default: boolean;
    var: Ident;
    body: Expr;
}

export interface Annotated {
    kind: 'Annotated'
    type: typing.Type
    expr: Expr
}