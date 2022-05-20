import { GeneratePrimeOptionsArrayBuffer } from 'crypto';
import * as json from '../parser/json_ast';
import * as justin from '../parser/justin_ast';
import * as jessie from '../parser/jessie_ast';
import * as typing from './typing'

`
// json_ast
DataLiteral = boolean | number | string | 'null'
ArrayLiteral = '[' repeated (Expr, ',') ']'  // no hole nor spread
ObjectLiteral = '{' repeated ((boolean | number | Ident), ':', Expr, ',') '}' // no spread
DataStructure = DataLiteral | ArrayLiteral | ObjectLiteral | undefined
`

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
    elems: Expr[]
}

export function Array(elems: Expr[]): Array {
    return { kind: 'Array', elems }
}

export type Attribute = 'field' | 'getter' | 'setter'

export interface Record {
    kind: 'Record'
    fields: [string, Expr, Attribute][]
}

export function Record(fields: [string, Expr][]): Record {
    return { kind: 'Record', fields }
}



// Identifier
export type Ident = json.Ident

`
// justin_ast
CondExpr = Expr '?' Expr ':' Expr
BinaryExpr = Expr BinaryOp Expr
BinaryOp = '||' | '&&' | '<=' ...
UnaryExpr = PreOp Expr
PreOp = 'void' | '+' | '-' | '~' | '!'
PostExpr = PrimaryExpr PostOp
PostOp = '[' Expr ']' | '.' Ident | '(' repeated (Expr ',') ')'
Expr = CondExpr | BinaryExpr | UnaryExpr | CallExpr | PrimaryExpr
`

export interface CondExpr {
    kind: 'CondExpr'
    cond: Expr
    ifTrue: Expr
    ifFalse: Expr
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

export interface PostExpr {
    kind: 'PostExpr'
    callee: PrimaryExpr
    postop: PostOp
}

export type PostOp = 
    | IndexOp
    | PropertyOp
    | CallOp

export interface IndexOp {
    kind: 'IndexOp'
    index: Expr
}

export interface PropertyOp {
    kind: 'PropertyOp'
    name: string
}

export interface CallOp {
    kind: 'CallOp'
    args: Expr[]
}

export type Expr = CondExpr | BinaryExpr | UnaryExpr | PostExpr | Ident | DataStructure | ArrowFunction

`
// jessie_ast
ArrowFunction = '(' repeated (Ident ',') ')' '=>' (Block | Expr)
PrimaryExpr = Ident | DataStructure | ArrowFunction | '(' Expr ')'

LefthandExpr = Ident | PrimaryExpr '[' Expr#number|call# ']' | PrimaryExpr '.' Ident
RighthandExpr = Expr | ArrowFunction 
Assignment = LeftHandExpr '=' Expr

Statement = Block | Declaration | If | Breakable | Terminator | Assignment | Expr
Block = '{' repeated Statement '}'
Declaration = ('const' | 'let') Ident '=' Expr
If = 'if' '(' Expr ')' Block ('else' (Block|If))?
Breakable = For | While | Switch
Terminator = Continue | Break | Return

Module = ModuleItem*
ModuleItem = ImportDeclaration | ExportDeclaration | 'const' Ident '=' Expr
`

export interface ArrowFunction {
    kind: 'ArrowFunction'
    args: Ident[]
    body: Block|Expr
}

export function ArrowFunction(args: Ident[], body: Block|Expr): ArrowFunction {
    return { kind: 'ArrowFunction', args, body }
}

export type PrimaryExpr = Expr

export type LefthandExpr = Ident | (PostExpr & { postop: { kind: 'IndexOp'|'PropertyOp' } })

export interface Assignment {
    kind: 'Assignment'
    left: LefthandExpr
    right: Expr
}

export interface Statement {
    kind: 'Statement'
    body: Block | Declaration |/* If | Breakable | Terminator |*/ Assignment | Expr 
}

export interface Block {
    kind: 'Block'
    body: Statement[]
}

export interface Declaration {
    kind: 'Declaration'
    declop: 'const'|'let'
    name: Ident
    expr: Expr
}

`
// tessie_ast
override Declaration = ('const' | 'let') Ident ':' Type '=' RighthandExpr
override ModuleItem = ModuleItem | TypeDeclaration
override ArrowFunction = '(' repeated (Ident ':' Type ',') ')' (':' Type)? '=>' (Block | Expr) 
TypeDeclaration = 'interface' Ident ObjectType | 'type' Ident '=' Type

PrimitiveType = 'number' | 'bigint' | 'boolean' | 'string' | 'undefined'
LiteralType = DataLiteral
FunctionType = '(' repeated (Ident ':' Type ,) ')' '=>' Type
ObjectType = '{' repeated (Ident ':' Type ,) '}'
ArrayType = Type '[]'
TupleType = '[' repeated (Type ,) ']'
Type = Ident | PrimitiveType | LiteralType | FunctionType | ObjectType | ArrayType | TupleType | Type '|' Type | Type '?'
`

export interface Declaration {
    type: Type
}

export interface FunctionArg {
    type: Type
}

export interface ArrowFunction {
    returntype?: Type
}

export interface TypeDeclaration {
    kind: 'TypeDeclaration'
    declop: 'interface' | 'type'
    name: Ident
    type: Type
}

export interface PrimitiveType {
    kind: 'PrimitiveType'
    type: 'number' | 'bigint' | 'boolean' | 'string' | 'undefined' 
}

export interface LiteralType {
    kind: 'LiteralType'
    type: DataLiteral
}

export interface NamedType {
    name: Ident
    type: Type
}

export function NamedType(name: Ident, type: Type): NamedType { return { name, type } }

export interface FunctionType {
    kind: 'FunctionType'
    args: NamedType[]
    returntype?: Type
}

export function FunctionType(args: NamedType[], returntype?: Type): FunctionType { return { kind: 'FunctionType', args, returntype } }

export interface ObjectType {
    kind: 'ObjectType'
    // oneof args index
    args?: NamedType[]
    index?: [PrimitiveType, Type]
}

export function ObjectType(args: NamedType[]): ObjectType { return { kind: 'ObjectType', args } }

export function IndexedObjectType(key: PrimitiveType, value: Type): ObjectType { return { kind: 'ObjectType', index: [key, value] } }

export interface ArrayType {
    kind: 'ArrayType'
    type: Type
}

export function ArrayType(type: Type): ArrayType { return { kind: 'ArrayType', type } }

export interface TupleType {
    kind: 'TupleType'
    args: Type[]
}

export function TupleType(args: Type[]): TupleType { return { kind: 'TupleType', args } }

export interface UnionType {
    kind: 'UnionType'
    args: Type[]
}

export function UnionType(args: Type[]): UnionType { return { kind: 'UnionType', args } }

export interface OptionalType {
    kind: 'OptionalType'
    type: Type
}

export function OptionalType(type: Type): OptionalType { return { kind: 'OptionalType', type } }

export type Type = 
    | Ident
    | PrimitiveType 
    | LiteralType 
    | FunctionType 
    | ObjectType 
    | ArrayType 
    | TupleType 
    | UnionType
    | OptionalType



/*
// Intermediate form is untyped, sugar-free syntax
// Directly compiled into wasm.



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
*/