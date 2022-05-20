import ohm from 'ohm-js';
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
        CondExpr3 = OrElseExpr4 ("?" AssignExpr ":" AssignExpr)?
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
        PowExpr14 = (CallExpr ("**" CallExpr)*)? UnaryExpr
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

        Terminator = ("continue" | "break" | Return | Throw) ";"
        Return = "return" AssignExpr?
        Throw = "throw" AssignExpr

        ExprStatement = AssignExpr ";"

        // jessie A.4 Functions and Classes
        Args 
            = useVar -- var
            | "(" ListOf<useVar, ",">? ")" -- args
        ArrowFunc = Args "=>" (Block | AssignExpr)

        // jessie A.5 Scripts and Modules
        ModuleBody = ModuleItem*
        ModuleItem = ImportDecl | ModuleDecl
        ImportDecl = "TODO: Not implemented"
        ModuleDecl = ("export")? "const" useVar ("=" HardenedExpr)?
        HardenedExpr = dataLiteral | undefined | ArrowFunc | DataStructure | useVar
    }
`);

JessieZero.createSemantics().addOperation('transpile', {
    Module(e) { return e.transpile() },

    // json
    DataStructure(e) { return e.transpile() },
    dataLiteral(e) { return e.transpile() },
    booleanLiteral(e) { return json.BooleanLiteral(e.sourceString === 'true' ? true : false) },
    numberLiteral(neg, num, big) { return json.NumberLiteral(num.sourceString) },
    stringLiteral(quostr) { return json.StringLiteral(quostr.sourceString.slice(1, -1)) },
    ArrayLiteral(_1, elems, _2) { return ast.Array(elems.asIteration().children.map(x => x.transpile())) },
    ObjectLiteral(_1, elems, _2) { return ast.Record(elems.asIteration().children.map(x => x.transpile())) },
    PropDef_field(name, _, value) { return [name.sourceString, value.transpile(), 'field'] },
    PropDef_getter(_1, name, _2, _3, block) { return [name.sourceString, ast.ArrowFunction([], block.transpile()), 'getter'] },
    PropDef_setter(_1, name, _2, value, _3, block) { return [name.sourceString, ast.ArrowFunction([json.Ident(value.sourceString)], block.transpile()), 'setter'] },

    // jessie A.5 Scripts and Modules
    ModuleBody(e) { return e.asIteration().map(ast.apply) }
})