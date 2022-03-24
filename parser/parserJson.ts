import { TokenKind, lexer } from './lexer.ts';
import * as ast from './ast.ts';
import { Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, kmid, lrec_sc, seq, str, tok } from 'typescript-parsec';

export const ASSIGN_EXPR = rule<TokenKind, ast.AssignExpr>();
ASSIGN_EXPR.setPattern(
  
)
