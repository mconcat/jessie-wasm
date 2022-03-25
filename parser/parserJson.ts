import { TokenKind, lexer } from './lexer.ts';
import * as ast from './ast.ts';
import { Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, kmid, lrec_sc, seq, str, tok } from 'typescript-parsec';

export const ASSIGN_EXPR = rule<TokenKind, ast.AssignExpr>();
export const PRIMARY_EXPR = rule<TokenKind, ast.PrimaryExpr>();

export const DATA_STRUCTURE = rule<TokenKind, ast.DataStructure>();
export const DATA_LITERAL = rule<TokenKind, ast.DataLiteral>();
export const ARRAY = rule<TokenKind, ast.Array>();



ASSIGN_EXPR.setPattern(
    alt(PRIMARY_EXPR, COND_EXPR)
);

PRIMARY_EXPR.setPattern(
    alt(DATA_STRUCTURE, EXPR, USEVAR)
);


DATA_STRUCTURE.setPattern(
    alt(UNDEFINED, DATA_LITERAL, ARRAY, RECORD)
)

UNDEFINED.setPattern(
    apply(tok(TokenKind.Undefined), ast.applyUndefined)
)

DATA_LITERAL.setPattern(
    alt(
        apply(tok(TokenKind.Null), ast.applyNullLiteral),
        apply(tok(TokenKind.False), ast.applyFalseLiteral),
        apply(tok(TokenKind.True), ast.applyTrueLiteral),
        apply(tok(TokenKind.Number), ast.applyNumberLiteral),
        apply(tok(TokenKind.String), ast.applyStringLiteral),
    )
)

ARRAY.setPattern(
    kmid(
        tok(TokenKind.LBracket),
        rep()
        tok(TokenKind.RBracket),
    )
)
