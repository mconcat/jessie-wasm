import { TokenKind, lexer } from './lexer';
import * as ast from './json_ast';
import { Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule, Rule, Parser } from 'typescript-parsec';
import { alt, apply, kleft, kmid, kright, lrec_sc, seq, str, opt, tok } from 'typescript-parsec';

function seperatedList<Kind, Elem>(
    leftSeparator: TokenKind, 
    content: Rule<TokenKind, Elem>, 
    kind: Kind,
    rightSeparator: TokenKind
) : Parser<TokenKind, {kind: Kind, data: Elem[]}> {
    return kmid(
        tok(leftSeparator),
        apply(opt(kleft(lrec_sc(
            apply(content, ast.single(kind)), 
            kright(tok(TokenKind.Comma), content),
            ast.append(kind)
        ), opt(tok(TokenKind.Comma)))), 
            (value) => value ? value : ast.empty(kind)
        ),
        tok(rightSeparator),
    )
}

// PureExpr, PureArray, PureRecord is used for hardened expression, 
// which will be checked by static analyzer phase.
// Ommiting them inside of the parser.

export const ASSIGN_EXPR = rule<TokenKind, ast.AssignExpr>();
export const PRIMARY_EXPR = rule<TokenKind, ast.PrimaryExpr>();

export const IDENT = rule<TokenKind, ast.Ident>();
export const DATA_STRUCTURE = rule<TokenKind, ast.DataStructure>();
export const DATA_LITERAL = rule<TokenKind, ast.DataLiteral>();
export const ARRAY = rule<TokenKind, ast.Array>();
export const ELEMENT = rule<TokenKind, ast.Element>();
export const RECORD = rule<TokenKind, ast.Record>();
export const PROP_DEF = rule<TokenKind, ast.PropDef>();
export const PROP_NAME = rule<TokenKind, ast.DataLiteral>();

DATA_LITERAL.setPattern(
    alt(
        apply(tok(TokenKind.Null), ast.applyNullLiteral),
        apply(tok(TokenKind.Bool), ast.applyBoolLiteral),
        apply(tok(TokenKind.Number), ast.applyNumberLiteral),
        apply(tok(TokenKind.String), ast.applyStringLiteral),
    )
)


PROP_NAME.setPattern(
    alt(
        DATA_LITERAL,
        IDENT,
    )_
)

ELEMENT.setPattern(
    // alt(ASSIGN_EXPR)
    apply(seq(opt(tok(TokenKind.Ellipsis)), ASSIGN_EXPR), ([e, expr]) => ast.applyElement(e, expr))
)

ARRAY.setPattern(
    seperatedList(
        TokenKind.LBracket,
        ELEMENT,
        'Array',
        TokenKind.RBracket,
    ) 
)

PROP_DEF.setPattern(
    apply(
        seq(PROP_NAME, opt(kright(tok(TokenKind.Colon), ASSIGN_EXPR))), 
        ([name, expr]) => ast.applyPropDef(name, expr),
    ) 
)

RECORD.setPattern(
    seperatedList(
        TokenKind.LBrace,
        PROP_DEF,
        'Record',
        TokenKind.RBrace,
    ) 
)

DATA_STRUCTURE.setPattern(
    alt(
       //  apply(tok(TokenKind.Undefined), ast.applyUndefined), 
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

IDENT.setPattern(
    apply(tok(TokenKind.Ident), ast.applyIdent),
)



