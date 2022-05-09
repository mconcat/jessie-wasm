import * as typing from './typing';
import * as ast from './ast';

// https://www.typescriptlang.org/static/TypeScript%20Interfaces-34f1ad12132fb463bd1dfe5b85c5b2e6.png
// https://www.typescriptlang.org/static/TypeScript%20Types-4cbf7b9d45dc0ec8d18c6c7a0c516114.png
export interface TypeDeclaration {
    kind: 'TypeDeclaration'
    isInterface: boolean
    decl: typing.Type
}

export interface Env {
    decls: TypeDeclaration[]
    vars: {[key: string]: typing.Type}
}

export interface TypedExpr {
    kind: 'TypedExpr'
    expr: ast.Expr
    type?: typing.Type
}

export function TypedExpr(expr: ast.Expr, type: typing.Type): TypedExpr {
    return { kind: 'TypedExpr', expr, type }
}

export function infer(env: Env, expr: ast.Expr, ...expectedType: typing.Type[]): TypedExpr {
    let typedexpr = ((): TypedExpr => {
        switch (expr.kind) {
        // case 'Declaration': return inferDeclaration(env, expr)
        case 'Undefined': return TypedExpr(expr, typing.UndefinedType())
        case 'NullLiteral': return TypedExpr(expr, typing.NullType())
        case 'BooleanLiteral': return TypedExpr(expr, typing.BooleanLiteralType(expr.data))
        case 'NumberLiteral': return TypedExpr(expr, typing.NumberLiteralType(expr.data))
        case 'StringLiteral': return TypedExpr(expr, typing.StringLiteralType(expr.data))
        case 'Array': return inferArray(env, expr)
        case 'Record': return inferRecord(env, expr)
        case 'BinaryExpr': return inferBinaryExpr(env, expr)
        case 'UnaryExpr': return inferUnaryExpr(env, expr)
        // case 'AssignExpr': return inferAssignExpr(env, expr)
        // case 'Block': return inferBlock(env, expr)
        // case 'IfThenElse': return inferIfThenElse(env, expr)
        // case 'TryCatch': return inferTryCatch(env, expr)
        // case 'While': return inferWhile(env, expr)
        // case 'Closure': return inferClosure(env, expr)
        case 'CallExpr': return inferCallExpr(env, expr)
        case 'PropertyExpr': return inferPropertyExpr(env, expr)
        case 'IndexExpr': return inferIndexExpr(env, expr)
        // TODO: export import terminator
        }
    })()
}

export function inferArray(env: Env, expr: ast.Array): (TypedExpr|undefined) {
    var arraytype: typing.Type = undefined
    var tupletype: typing.Type[] = []
    for (const elem of expr.data) {
        let elemtype = infer(env, elem[0])
        if (elem[1]) {
            // TODO: spread notation
        }
        if (arraytype) {
            if (!arraytype.isAssignable(elemtype.type)) arraytype = arraytype.unionize(elemtype.type, arraytype)
        } else {
            tupletype.push(elemtype.type)
        }
    }
    return TypedExpr(expr, arraytype? typing.ArrayType(arraytype): typing.TupleType(tupletype))
}

export function inferRecord(env: Env, expr: ast.Record): (TypedExpr|undefined) {
    var fields: [string, typing.Type][] = []
    for (const field of expr.data) {
        let fieldtype = infer(env, field[1])
        fields.push([field[0], fieldtype.type])
    }
    return TypedExpr(expr, typing.ObjectType(fields))
}



// assumption: redundant trees are already cut. 
// TODO: need to reassign children types to typeexpr
export function inferBinaryExpr(env: Env, expr: ast.BinaryExpr): (TypedExpr|undefined) {
    switch (expr.op) {
    case 'OrElseOp': 
    case 'AndThenOp':
        return TypedExpr(expr, infer(env, expr.left).type.unionize(infer(env, expr.right).type))
    case 'LessEqualOp':
    case 'LessOp':
    case 'GreaterEqualOp':
    case 'GreaterOp':
    case 'EqualOp':
    case 'NotEqualOp': {
        let left = infer(env, expr.left)
        let right = infer(env, expr.right, left.type)
        return TypedExpr(expr, typing.BooleanType())
    }
    case 'BitAndOp':
    case 'BitOrOp':
    case 'BitXorOp':
    case 'LeftShiftOp':
    case 'RightShiftOp':
    case 'UnsignedRightShiftOp':
    case 'SubOp':
    case 'MultOp':
    case 'DivOp':
    case 'ModOp':
    case 'PowOp': {
        let left = infer(env, expr.left, typing.NumberType(), typing.BigintType())
        let right = infer(env, expr.right, left.type)
        return TypedExpr(expr, right)
    }
    case 'AddOp': {
        let left = infer(env, expr.left, typing.NumberType(), typing.BigintType(), typing.StringType())
        let right = infer(env, left)
        return TypedExpr(expr, right)
    }
    }
}

export function inferUnaryExpr(env: Env, expr: ast.UnaryExpr): TypedExpr {
    switch (expr.op) {
    case 'VoidOp': return TypedExpr(expr, typing.UndefinedType())
    // case 'TypeofOp': 
    case 'PositiveOp': { 
        let child = infer(env, expr.expr, typing.NumberType(), typing.BooleanType())
        return TypedExpr(expr, typing.NumberType())
    }
    case 'NegativeOp': {
        let child1 = infer(env, expr.expr, typing.NumberType(), typing.BooleanType())
        if (child1) return TypedExpr(expr, typing.NumberType())
        let child2 = infer(env, expr.expr, typing.BigintType())
        return TypedExpr(expr, typing.BigintType())
    }
    case 'TildeOp': {
        let child = infer(env, expr.expr, typing.NumberType(), typing.BigintType())
        return TypedExpr(expr, child)
    }
    case 'BangOp': {
        let child = infer(env, expr.expr, typing.BooleanType())
        return TypedExpr(expr, typing.BooleanType())
    }
    }
}

export function inferClosure(env: Env, expr: ast.Closure): (TypedExpr|undefined) { 
    // TODO
    // make a copy of env, inference variable types by its usage inside the closure, return the closure type
    return undefined
}

export function inferCallExpr(env: Env, expr: ast.CallExpr): (TypedExpr|undefined) {
    // TODO
    // check if the callee's type signature exists inside env.vars
    // if true, execute expected inference on the respective arguments
    // if not, inference arguments and return inferred function 
    return undefined
}

export function inferPropertyExpr(env: Env, expr: ast.PropertyExpr): (TypedExpr|undefined) {
    // TODO
    // inference object type by property access
    return undefined
}

export function inferIndexExpr(env: Env, expr: ast.IndexExpr): (TypedExpr|undefined) {
    // TODO
    // inference array/index object type by property access
    return undefined
}

