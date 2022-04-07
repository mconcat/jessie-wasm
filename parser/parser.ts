import { TokenKind, lexer } from './lexer';
import * as ast from './ast';
import { Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule, Rule, Parser } from 'typescript-parsec';
import { alt, apply, kleft, kmid, kright, lrec_sc, seq, str, opt, tok } from 'typescript-parsec';

function seperatedList<T, U>(
    leftSeparator: TokenKind, 
    content: Rule<TokenKind, T>, 
    app: (x: T) => U,
    concat: (xs: U, x: T) => U, 
    rightSeparator: TokenKind
) : Parser<TokenKind, U> {
    return kmid(
        tok(leftSeparator),
        kleft(lrec_sc(
            apply(content, app), 
            kright(tok(TokenKind.Comma), content),
            concat
        ), opt(tok(TokenKind.Comma))),
        tok(rightSeparator),
    )
}

export const ASSIGN_EXPR = rule<TokenKind, ast.AssignExpr>();
export const PRIMARY_EXPR = rule<TokenKind, ast.PrimaryExpr>();
export const PURE_EXPR = rule<TokenKind, ast.PureExpr>();

export const DATA_STRUCTURE = rule<TokenKind, ast.DataStructure>();
export const DATA_LITERAL = rule<TokenKind, ast.DataLiteral>();
export const ARRAY = rule<TokenKind, ast.Array>();
export const ELEMENT = rule<TokenKind, ast.ArrayElement>();
export const PURE_RECORD = rule<TokenKind, ast.PureRecord>();
export const PURE_PROP_DEF = rule<TokenKind, ast.PurePropDef>();
export const RECORD = rule<TokenKind, ast.Record>();
export const PROP_DEF = rule<TokenKind, ast.PropDef>();
export const PROP_NAME = rule<TokenKind, string>();

DATA_LITERAL.setPattern(
    alt(
        apply(tok(TokenKind.Null), ast.applyNullLiteral),
        apply(tok(TokenKind.False), ast.applyFalseLiteral),
        apply(tok(TokenKind.True), ast.applyTrueLiteral),
        apply(tok(TokenKind.Number), ast.applyNumberLiteral),
        apply(tok(TokenKind.String), ast.applyStringLiteral),
    )
)


ELEMENT.setPattern(
    // alt(ASSIGN_EXPR)
    apply(seq(opt(tok(TokenKind.Ellipsis)), ASSIGN_EXPR), ([e, expr]) => ast.applyElement(e, expr))
)

PURE_RECORD.setPattern(
    seperatedList(
        TokenKind.LBrace,
        PURE_PROP_DEF,
        ast.applyPureRecord,
        ast.appendPureRecord,
        TokenKind.RBrace,
    )
)

PURE_PROP_DEF.setPattern(
    apply(
        seq(PROP_NAME, opt(kright(tok(TokenKind.Colon), PURE_EXPR))), 
        ([name, expr]) => ast.applyPurePropDef(name, expr),
    )
)

PROP_DEF.setPattern(
    apply(
        seq(PROP_NAME, opt(kright(tok(TokenKind.Colon), ASSIGN_EXPR))), 
        ([name, expr]) => ast.applyPropDef(name, expr),
    ) 
)

PURE_RECORD.setPattern(

)

RECORD.setPattern(
    
)

DATA_STRUCTURE.setPattern(
    alt(
        apply(tok(TokenKind.Undefined), ast.applyUndefined), 
        DATA_LITERAL, 
        ARRAY, 
        RECORD,
    )
)

PRIMARY_EXPR.setPattern(
    // alt(DATA_STRUCTURE, EXPR, USEVAR)
    DATA_STRUCTURE
);

ASSIGN_EXPR.setPattern(
    // alt(PRIMARY_EXPR, COND_EXPR)
    PRIMARY_EXPR
);



export function evaluate<T>(expr: string, parser: Parser<TokenKind, T>): T {
    return expectSingleResult(expectEOF(parser.parse(lexer.parse(expr))))
}

