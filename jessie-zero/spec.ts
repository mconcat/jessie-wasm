import ohm from 'ohm-js';
import { chdir } from 'process';
import * as json from '../parser/json_ast'
import * as ast from './ast'

export const JessieZero = ohm.grammar(`
    JessieZero {
        Module = ModuleBody

        // json
        DataStructure = dataLiteral | ArrayLiteral | ObjectLiteral
        dataLiteral = booleanLiteral | numberLiteral | stringLiteral | "null"
        booleanLiteral = "true" | "false"
        numberLiteral = "-"? digit+ "n"?
        stringLiteral = "\"" (alnum | space)* "\"" | "\'" (alnum | space)* "\'"
        ArrayLiteral = "[" ListOf<AssignExpr, ",">?  "]"
        ObjectLiteral = "{" ListOf<PropDef, ",">? "}"
        propName = ident // TODO: __proto__
        PropDef
            = dataLiteral ":" AssignExpr -- field
            | "get " ident "(" ")" Block -- getter
            | "set " ident "(" useVar ")" Block -- setter
 
        // justin A.1 Lexical Grammar
        keyword 
            = "break" | "case" | "catch" | "const" | "continue" | "debugger" | "default" | "else" | "export"
            | "finally" | "for" | "function" | "if" | "import" | "return" | "switch" | "throw" | "try" 
            | "typeof" | "void" | "while"

        reservedWord
            = keyword | reservedKeyword | futureReservedWord  
            | "null" | "false" | "true" | "async" | "arguments" | "eval" | "get" | "set"

        reservedKeyword 
            = "class" | "delete" | "do" | "extends" | "instanceof" | "in" | "new" | "super" | "this" | "var"
            | "with" | "yield"
        
        futureReservedWord 
            = "await" | "enum" | "implements" | "package" | "protected" | "interface" | "private" | "public"

        declOp = "const" | "let"

        ident = ~(declOp | keyword | reservedWord | reservedKeyword | futureReservedWord) (letter alnum*)
        useVar = ident

        // justin A.2 Expressions
        undefined = "undefined"

        // https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
        BinaryExpr<child, op>
            = BinaryExpr<child, op> op child -- branch
            | ~op child -- child
        CondExpr3 
            = OrElseExpr4 "?" AssignExpr ":" AssignExpr -- branch
            | OrElseExpr4 -- child
        OrElseExpr4 = BinaryExpr<AndThenExpr5, orElseOp>
        orElseOp = "||" | "??"
        AndThenExpr5 = BinaryExpr<BitOrExpr6, "&&">
        BitOrExpr6 = BinaryExpr<BitAndXorExpr7, "|">
        BitAndXorExpr7 = BinaryExpr<EqualExpr9, bitAndXorOp>
        bitAndXorOp = "^" | "&"
        EqualExpr9 = BinaryExpr<CompExpr10, equalOp>
        equalOp = "===" | "!=="
        CompExpr10 = BinaryExpr<ShiftExpr11, compOp> 
        compOp = "<=" | "<" | ">=" | ">"
        ShiftExpr11 = BinaryExpr<AddExpr12, shiftOp>
        shiftOp = "<<" | ">>>" | ">>"
        AddExpr12 = BinaryExpr<MultExpr13, addOp>
        addOp = "+" | "-"
        MultExpr13 = BinaryExpr<PowExpr14, multOp>
        multOp = "*" | "/" | "%"
        PowExpr14 
            = CallExpr "**" PowExpr14 -- branch
            | UnaryExpr -- child
        UnaryExpr = PreOp* CallExpr
        PreOp = ("+" | "-" | "~" | "!")
        CallExpr = PrimaryExpr CallPostOp*
        PostOp
            = "[" UnaryExpr "]" -- index
            | "." ident -- property
        CallPostOp 
            = PostOp -- post
            | "(" ListOf<AssignExpr, ",">? ")" -- call
        
        // jessie A.2 Expressions
        AssignExpr 
            = ArrowFunc -- arrow
            | LValue CallPostOp -- callpost
            | LValue ("=" | AssignOp) AssignExpr -- assign
            | "[" ListOf<useVar, ","> "]" "=" CallExpr -- multireturn
            | CondExpr3 -- arithmetic
            | PrimaryExpr -- primary
        AssignOp 
            = "*=" | "/=" | "%=" | "+=" | "-="
            | "<<=" | ">>=" | ">>>="
            | "&=" | "^=" | "|="
            | "**="        
        PrimaryExpr 
            = "(" AssignExpr ")" -- paren
            | useVar -- var
            | DataStructure -- data

        LValue 
            = PrimaryExpr PostOp -- post
            | useVar -- var

        // jessie A.3 Statments
        Declaration = declOp useVar "=" AssignExpr ";"
        Statement = (Block | IfThenElse | BreakableStatement | Terminator | ExprStatement) 
        StatementItem = Declaration | Statement
        
        Block = "{" StatementItem* "}"
        IfThenElse = "if" "(" AssignExpr ")" Block ("else" space (IfThenElse | Block))?
        BreakableStatement = "TODO: Not implemented"

        Terminator = Continue | Break | Return | Throw
        Continue = "continue" ";"
        Break = "break" ";"
        Return = "return" AssignExpr? ";"
        Throw = "throw" AssignExpr ";"

        ExprStatement = AssignExpr ";"

        // jessie A.4 Functions and Classes
        Args 
            = useVar -- lambda
            | "(" ListOf<useVar, ","> ")" -- arrow
        ArrowFunc = Args "=>" (Block | AssignExpr)

        // jessie A.5 Scripts and Modules
        ModuleBody = ModuleItem*
        ModuleItem = ImportDecl | ModuleDecl
        ImportDecl = "TODO: Not implemented"
        ModuleDecl = "const" useVar "=" HardenedExpr
        HardenedExpr = dataLiteral | undefined | ArrowFunc | DataStructure | useVar
    }
`);

export const semantics = JessieZero.createSemantics()

semantics.addOperation('transpile', {
    Module(e) { return e.transpile() },

    // json
    DataStructure(e) { return e.transpile() },
    dataLiteral(e) { return e.transpile() },
    booleanLiteral(e) { return json.BooleanLiteral(e.sourceString === 'true' ? true : false) },
    numberLiteral(neg, num, big) { return json.NumberLiteral(num.sourceString) },
    stringLiteral(_1, str, _2) { return json.StringLiteral(str.sourceString) },
    ArrayLiteral(_1, elems, _2) { return ast.Array(elems.asIteration().children.map((x: ohm.Node) => x.transpile())) },
    ObjectLiteral(_1, elems, _2) { return ast.Record(elems.asIteration().children.map((x: ohm.Node) => x.transpile())) },
    PropDef_field(name, _, value) { return [name.sourceString, value.transpile(), 'field'] },
    PropDef_getter(_1, name, _2, _3, block) { return [name.sourceString, ast.ArrowFunction([], block.transpile()), 'getter'] },
    PropDef_setter(_1, name, _2, value, _3, block) { return [name.sourceString, ast.ArrowFunction([value.sourceString], block.transpile()), 'setter'] },

    // justin A.2 Expressions
    undefined(_) { return json.Undefined() },
    CondExpr3_branch(cond, _1, ifTrue, _2, ifFalse) { return ast.CondExpr(cond.transpile(), ifTrue.transpile(), ifFalse.transpile()) },
    CondExpr3_child(child) { return child.transpile() },
    BinaryExpr_branch(left, op, child) { return ast.BinaryExpr(left.transpile(), child.transpile(), op.sourceString as ast.BinaryOp) },
    BinaryExpr_child(child) { return child.transpile() },
    PowExpr14_branch(child, op, right) { return ast.BinaryExpr(child.transpile(), right.transpile(), op.sourceString as '**') },
    PowExpr14_child(child) { return child.transpile() },
    UnaryExpr(preops, callexpr) { return callexpr.transpile() /*TODO*/ },
    CallExpr(primary, postops) { return primary.transpile() /*TODO*/ },

    // jessie A.2 Expressions
    AssignExpr_arrow(e) { return e.transpile() },
    AssignExpr_arithmetic(e) { return e.transpile() },
    AssignExpr_primary(e) { return e.transpile() },

    PrimaryExpr_paren(_1, e, _2) { return e.transpile() },
    PrimaryExpr_var(e) { return json.Ident(e.sourceString) },
    PrimaryExpr_data(e) { return e.transpile() },

    // jessie A.3 Statments
    Declaration(declop, name, _1, expr, _2) { return ast.Declaration(declop.sourceString as ast.Declaration['declop'], name.sourceString, expr.transpile()) },
    Statement(e) { return e.transpile() },
    Block(_1, body, _2) { return ast.Block(body.children.map(x => x.transpile()))},
    Terminator(e) { return e.transpile() },
    // Return(_1, expr, _2) { return  }
    ExprStatement(expr, _) { return ast.ExprStatement(expr.transpile()) },


    // jessie A.4 Functions and Classes
    Args_lambda(e) { return [e.sourceString] },
    Args_arrow(_1, e, _2) { return e.asIteration().children.map((x: ohm.Node) => x.sourceString) },
    ArrowFunc(args, _, body) { return ast.ArrowFunction(args.transpile(), body.transpile()) },

    // jessie A.5 Scripts and Modules
    ModuleBody(e) { return ast.Module(e.children.map(x => x.transpile())) },
    ModuleDecl(_1, name, _2, value) { return ast.Declaration('const', name.sourceString, value.transpile()) },
    HardenedExpr(e) { return e.transpile() },

    _iter(...children) {
        return children.map(c => c.transpile());
    }
})

export function transpile(x: string): ast.Module {
    return semantics(JessieZero.match(x)).transpile()
}