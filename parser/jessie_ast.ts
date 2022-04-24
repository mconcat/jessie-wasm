import { TokenKind } from './lexer';
import * as json from './json_ast'
import * as justin from './justin_ast'
import * as parsec from 'typescript-parsec';
import { PipelineDestinationIterableFunction } from 'stream';
import { ReadableStreamDefaultReadValueResult } from 'stream/web';

type Token = parsec.Token<TokenKind>;

export type StatementItem = 
    | Declaration
    | FunctionDecl
    | Statement

export type DeclOp = 'const' | 'let'

export interface Declaration {
    kind: 'Declaration';
    op: DeclOp;
    bindings: Binding[];
}

export interface Binding {
    kind: 'Binding';
    var?: json.Ident;
    destructure?: Destructure;
    expr?: json.AssignExpr;
}

export interface FunctionDecl {
    kind: 'FunctionDecl';
    name?: json.Ident;
    params: Param[];
}

export interface Param {
    kind: 'Param';
    name?: json.Ident;
    pattern?: Pattern;
    rest?: boolean;
    default?: json.AssignExpr;
}

export interface Pattern {
    kind: 'Pattern';
    destructure?: Destructure;
    matchLiteral?: json.DataLiteral;
    matchUndefined?: json.Undefined;
    matchVar?: json.Ident;
}

export interface Destructure {
    kind: 'Destructure';
    matchArray?: Param[];
    // matchRecord: 
}

export type Statement = 
    | Block
    | IfThenElse
    | TryCatch
    | For
    | While
    | Switch
    | Terminator
    | json.AssignExpr // StatementExpr

export interface Block {
    kind: 'Block';
    stats: StatementItem[];
}

export interface IfThenElse {
    kind: 'IfThenElse';
    cond: json.Expr;
    then: Block;
    else: Block|IfThenElse;
}

export interface TryCatch {
    kind: 'TryCatch';
    body: Block;
    catcher?: [Pattern, Block];
    finalizer?: Block;
}

export interface For {
    kind: 'For';
    // (const x of [])
    forof: [DeclOp, json.Ident|Destructure, json.Expr];
    // (let x = 1; x < 5; x++)
    triplet: [Declaration|undefined, json.Expr|undefined, json.Expr|undefined];

    body: Block;
}

export interface While {
    kind: 'While';
    cond: json.Expr;
    body: Block;
}

export interface Switch {
    kind: 'Switch';
    target: json.Expr;
    cases: Case[];
}

export interface Case {
    kind: 'Case';
    case: json.Expr[]; // empty if default
    body: StatementItem[]; // don't check terminator in parser
}

export type Terminator = Continue | Break | Return | Throw

export interface Continue {
    kind: 'Continue';
    label?: json.Ident;
}

export interface Break {
    kind: 'Break';
    label?: json.Ident;
}

export interface Return {
    kind: 'Return';
    value?: json.Expr;
}

export interface Throw {
    kind: 'Throw';
    value: json.Expr;
}

// ----------------------

export interface Arrow {
    kind: 'Arrow';
    params: Param[];
    body: Block|json.AssignExpr;
}


// ----------------------

export type ModuleItem = ImportDecl | ExportDecl | ModuleDecl

export interface ImportDecl {
    kind: 'ImportDecl';
    // TODO
}

export interface ExportDecl {
    kind: 'ExportDecl';
    default: boolean;
    // TODO
}

export type ModuleDecl = ModuleBinding[]

export interface ModuleBinding {
    kind: 'ModuleBinding';
    var?: json.Ident;
    destructure?: Destructure;
    expr?: HardenedExpr;
}

export type HardenedExpr = json.DataStructure | json.UseVar | Arrow | FunctionDecl | justin.CondExpr
 