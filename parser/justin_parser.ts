import { TokenKind, lexer } from './lexer';
import * as json from './json_parser'
import * as ast from './justin_ast';
import { Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule, Rule, Parser } from 'typescript-parsec';
import { alt, apply, kleft, kmid, kright, lrec_sc, seq, str, opt, tok } from 'typescript-parsec';

function binaryExpr<Kind, BinOp, Child>(
    kind: Kind,
    op: Parser<TokenKind, BinOp>,
    child: Rule<TokenKind, Child>, 
) : Parser<TokenKind, ast.BinaryExpr<Kind, BinOp, Child>> {
    return lrec_sc(
        apply(child, ast.single<Kind, BinOp, Child>(kind)),
        seq(op, child),
        ast.append(kind)
    )
}

export const CondExpr = rule<TokenKind, ast.CondExpr>();
export const OrElseExpr = rule<TokenKind, ast.OrElseExpr>();
export const AndThenExpr = rule<TokenKind, ast.AndThenExpr>();
export const EagerExpr = rule<TokenKind, ast.EagerExpr>();
export const ShiftExpr = rule<TokenKind, ast.ShiftExpr>();
export const AddExpr = rule<TokenKind, ast.AddExpr>();
export const MultExpr = rule<TokenKind, ast.MultExpr>();
export const PowExpr = rule<TokenKind, ast.PowExpr>();
export const CallExpr = rule<TokenKind, ast.CallExpr>();
export const UnaryExpr = rule<TokenKind, ast.UnaryExpr>();
export const CallPostOp = rule<TokenKind, ast.CallPostOp>();
export const MemberPostOp = rule<TokenKind, ast.MemberPostOp>();

OrElseExpr.setPattern(
    binaryExpr('OrElseExpr', apply(tok(TokenKind.OrElseLevelOp), (_) => 'OrElseOp'), AndThenExpr)
)

AndThenExpr.setPattern(
    binaryExpr('AndThenExpr', apply(tok(TokenKind.AndThenLevelOp), (_) => 'AndThenOp'), EagerExpr)
)

EagerExpr.setPattern(
    binaryExpr('EagerExpr', alt(
        apply(tok(TokenKind.RelLevelOp), ast.applyRelOp),
        apply(tok(TokenKind.EqLevelOp), ast.applyEqOp),
        apply(tok(TokenKind.BitLevelOp), ast.applyBitOp),
    ), ShiftExpr)
)

ShiftExpr.setPattern(
    binaryExpr('ShiftExpr', apply(tok(TokenKind.ShiftLevelOp), ast.applyShiftOp), AddExpr)
)

AddExpr.setPattern(
    binaryExpr('AddExpr', apply(tok(TokenKind.AddLevelOp), ast.applyAddOp), MultExpr)
)

MultExpr.setPattern(
    binaryExpr('MultExpr', apply(tok(TokenKind.MulLevelOp), ast.applyMultOp), PowExpr)
)

PowExpr.setPattern(
    apply(seq(
        rep(kleft(CallExpr, tok(TokenKind.Starstar))), 
        UnaryExpr,
    ), ast.applyPowExpr)
)

CallExpr.setPattern(
    apply(seq(
        json.PRIMARY_EXPR,
        rep(CallPostOp),
    ), ast.applyCallExpr)
)

CallPostOp.setPattern(
    alt(
        MemberPostOp,
        kmid(
            tok(TokenKind.LParen), 
            rep(json.ASSIGN_EXPR)
            tok(TokenKind.RParen),
        )
    )
)

MemberPostOp.setPattern(
    alt(
        kmid(tok(TokenKind.LBracket), UnaryExpr, tok(TokenKind.RBracket)),
        kright(tok(TokenKind.Dot), apply(tok(TokenKind.Ident), ast.applyGetMember),)
    )
)