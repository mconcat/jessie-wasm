export function evaluate<T>(expr: string, parser: Parser<TokenKind, T>): T {
    return expectSingleResult(expectEOF(parser.parse(lexer.parse(expr))))
}
