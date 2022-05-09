// generate runtime type info

// wasm is a static typed system, so it need to use type information to efficiently run jessie code

// runtime type information is restricted:
// - union type can only appear in:
//   - union of primitive types
//   - immediate right hand side of interface field
// - intersection types can only take object types
// - array type and object type are not interchangable
// - array type cannot have union type(optionals are ok)
// - tuple type cannot have union type(optionals are ok)
// - literal types are treated as respective primitive types
//   - (literal types are only used in compile time type checking)
// - optional types are discarded(all variables are treated as optional in runtime)

import * as typing from './typing'

// RuntimeType is a subset of Type
// RuntimeType can be serialized and passed between functions to implement generics
// RuntimeType is represented as 8-bit tag, which is prepended to 32-bit pointer in stack
export type Type = 
    | typing.PrimitiveType
    | typing.FunctionType 
    | typing.ObjectType 
    | typing.ArrayType 
    | typing.TupleType 
    // | RecordType // compiletime-unknown
    // | typing.VarType 
    // | typing.ParameterizedType

export function TypeTag(type: Type): number[] {
    var result: [number]
    switch (type.kind) {
    case 'PrimitiveType':
        if (type.type === 'NumberType') {
            result.push(0x00)
            break
        }
        result.push(0x01)
        switch (type.type) {
        case 'BigintType':
            result.push(0x01)
            break
        case 'BooleanType':
            result.push(0x02)
            break
        case 'StringType':
            result.push(0x03)
            break
        case 'NullType':
            result.push(0x04)
            break
        case 'UndefinedType':
            result.push(0x05)
            break
        }
        break
    case 'ObjectType':
        result.push(0x02)
        break
    case 'ArrayType':
        result.push(0x03)
        break
    case 'TupleType':
        result.push(0x04)
        break
    }
    return result
}

/*
export interface TypeTag {
    kind: 'TypeTag'

    type: PrimitiveType | 
    // primitive-stack types
    number?: string
    boolean?: boolean
    null?: null
    undefined?: undefined

    // primitive-heap types
    string?: number // pointer to [length: i32]
    bigint?: number // pointer to [length: i8, ...data: i64]

    // compiletime known heap type
    array?: number // pointer to [length: i32, ...data]
    tuple?: number // pointer to
    struct?: number // pointer to

    // compiletime unknown heap type
    object?: number // pointer to [hiddenclass, maptype] // TODO
}
*/
export function RuntimeType(type: typing.Type): (RuntimeType|undefined) {
    switch (type.kind) {
    case 'LiteralType':
        return RuntimeLiteralType(type)
    case 'PrimitiveType':
        return RuntimePrimitiveType(type)
    case 'FunctionType':
        return RuntimeFunctionType(type)
    case 'ObjectType':
        return RuntimeObjectType(type)
    case 'ArrayType':
        return RuntimeArrayType(type)
    case 'TupleType': 
        return RuntimeTupleType(type)
    default: 
        return undefined
    }
}

export function RuntimePrimitiveType(type: typing.PrimitiveType): (Type|undefined) {
    return type
}

export function RuntimeFunctionType(type: typing.FunctionType): (Type|undefined) {

}