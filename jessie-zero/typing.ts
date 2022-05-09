// Typescript style typing

import { KeyObjectType } from "crypto"

import * as json from '../parser/json_ast'


export interface TypeCheck {
    // isAssignable returns true only if subject is assignable to target
    // in other words, subject should be a subset of target.
    // or in another words, target should be able to be narrowed down to subject
    // https://www.typescriptlang.org/docs/handbook/type-compatibility.html
    isAssignable(subject: Type): boolean // self > subject
    // isCallable returns true only if the subjects are valid arguments for the function
    // always return false if not a function type
    isCallable(subject: Type[]): boolean
    // isIndexable returns true only if the subject is a valid index for the object/array
    // always return false if not a object/array type
    isIndexable(subject: Type): boolean
    // isAccessible returns true only if the field is a valid field for the object/array
    // and return the 
    // always return false if not a object/array type
    // if an index operation is done by known literal, use isAccessible to check instead.
    isAccessible(field: string): Type|undefined // TODO: should return getter/setter

    // intersect returns the intersection form
    intersect(subject: Type, self?: Type): Type // self * subject

    // unionize returns the union form
    unionize(subject: Type, self?: Type): Type // self + subject
}

function NotAssignable(_: Type): boolean { return false }
function NotCallable(_: Type[]): boolean { return false }
function NotIndexable(_: Type): boolean { return false }
function NotAccessible(_: string): Type|undefined { return undefined }

export type Type =
    | NeverType
    | LiteralType // string, boolean, number literal
    | PrimitiveType // set of primitive types
    | FunctionType // function
    | DataStructureType // objects, arrays, tuples
    | ComposedType // union, intersection, optional

//    | VarType // Type variable
//    | ParameterizedType // Generics

export interface NeverType extends TypeCheck {
    kind: 'NeverType'
}

export function NeverType(): NeverType {
    let isAssignable = NotAssignable
    let isCallable = NotCallable
    let isIndexable = NotIndexable
    let isAccessible = NotAccessible
    let intersect = (): Type => {
        return NeverType()
    }
    let unionize = (subject: Type): Type => {
        return subject
    }
    return { kind: 'NeverType', isAssignable, isCallable, isIndexable, isAccessible, intersect, unionize }
}

export interface LiteralType extends TypeCheck {
    kind: 'LiteralType'
    type: json.DataLiteral
}

export function LiteralType(type: json.DataLiteral): LiteralType {
    let isAssignable = (subject: Type) => {
        if (subject.kind !== 'LiteralType') return false
        return type === subject.type
    }
    let isCallable = NotCallable
    let isIndexable = NotIndexable
    let isAccessible = NotAccessible
    let intersect = (subject: Type): Type => {
        if (subject.kind === 'LiteralType' && subject.type === type) return subject
        return NeverType() 
    }
    let unionize = (subject: Type, self: Type) => {
        if (subject.kind === 'LiteralType' && subject.type === type) return subject
        return UnionType([self, subject])
    }
    return { kind: 'LiteralType', type, isAssignable, isCallable, isIndexable, isAccessible, intersect, unionize }
}

export function BooleanLiteralType(value: boolean): LiteralType { return LiteralType(json.BooleanLiteral(value)) }
export function NumberLiteralType(value: string): LiteralType { return LiteralType(json.NumberLiteral(value)) }
export function StringLiteralType(value: string): LiteralType { return LiteralType(json.StringLiteral(value)) }

export interface PrimitiveType extends TypeCheck {
    kind: 'PrimitiveType';
    type: 'StringType'
        | 'NumberType'
        | 'BigintType'
        | 'BooleanType'
        | 'NullType'
        | 'UndefinedType'
        // | 'VoidType'
        // | 'UnknownType'
}

export function PrimitiveType(
    type: PrimitiveType["type"], 
    literalKind?: json.DataLiteral['kind'],
    indexKind?: PrimitiveType["type"],
): PrimitiveType {
    let isAssignable = (subject: Type) => {
        // numbers are assignable to numbers, booleans are assignable to booleans,
        if (subject.kind === 'PrimitiveType') return subject.type === type
        // 3 is assignable to numbers, 'StringLiteral' is assignable to strings,
        if (literalKind && subject.kind === 'LiteralType') return subject.type.kind === literalKind
        return false
    }
    let isCallable = NotCallable
    let isIndexable = (subject: Type) => (indexKind && subject.kind === 'PrimitiveType' && subject.type === indexKind) ?? false
    let isAccessible = NotAccessible // TODO
    let intersect = (subject: Type): Type => {
        if (subject.kind === 'PrimitiveType' && subject.type === type) return subject
        else return NeverType()
    }
    let unionize = (subject: Type, self: Type): Type => {
        if (subject.kind === 'PrimitiveType' && subject.type === type) return subject
        else return UnionType([subject, self])
    }
    return { kind: 'PrimitiveType', type, isAssignable, isCallable, isIndexable, isAccessible, intersect, unionize }
}

export function StringType(): PrimitiveType { return PrimitiveType('StringType', 'StringLiteral', 'NumberType') }
export function NumberType(): PrimitiveType { return PrimitiveType('NumberType', 'NumberLiteral') }
export function BigintType(): PrimitiveType { return PrimitiveType('BigintType') } 
export function BooleanType(): PrimitiveType { return PrimitiveType('BooleanType', 'BooleanLiteral') }
export function NullType(): PrimitiveType { return PrimitiveType('NullType') }  
export function UndefinedType(): PrimitiveType { return PrimitiveType('UndefinedType') }
// export function VoidType(): PrimitiveType { return { kind: 'PrimitiveType', type: 'VoidType' }  }

export type DataStructureType =
    | ObjectType
    | ArrayType 
    | TupleType

export interface ObjectType extends TypeCheck {
    kind: 'ObjectType'
    type: [string, Type][] // assume sorted
    index?: [PrimitiveType, Type] // string, boolean, number only for now // string only for now
}

export function ObjectType(_type: [string, Type][], index?: [PrimitiveType, Type]): ObjectType {
    let type = _type.sort(([k1,], [k2,]) => +(k1>k2)) // always sort
    let isAssignable = (subject: Type): boolean => {
        // use object version of composed type TODO: cache
        if (subject.kind === 'IntersectionType' || subject.kind === 'UnionType' || subject.kind === 'OptionalType') {
            return isAssignable(subject.toType())
        }
        // compare all fields
        if (subject.kind === 'ObjectType') {
            for (let field of type) {
                if (!subject.isAccessible(field[0])) return false
            }
        }
        return true
    }
    let isCallable = NotCallable
    let isIndexable = (subject: Type): boolean => {
        if (!index) return false
        if (subject.kind === 'PrimitiveType') return subject.type === index[0].type
        // if (subject.kind === 'LiteralType') return subject.type.kind === index[0].type
        return false
    }
    let isAccessible = (field: string): Type|undefined => {
        // TODO: optimize
        const found = type.find(([k,]) => k===field)
        return found ? found[1] : undefined
    }
    let intersect = (subject: Type, self: Type): Type => {
        self = self as ObjectType
        // TODO: cache and optimize
        if (subject.kind === 'ObjectType') {
            var typearray: [string, Type][] = []
            for (const field of self.type) {
                typearray.push(field)
            }
            for (const field of subject.type) {
                if (!typearray.find(([k,]) => k===field[0]))
                    typearray.push(field)
            }
            // TODO: index
            return ObjectType(typearray)
        }
        return NeverType()
    }
    let unionize = (subject: Type, self: Type): Type => {
        self = self as ObjectType
        // TODO: cache
        if (subject.kind === 'ObjectType') {
           var typearray: [string, Type][] = []
           for (const field of self.type) {
                if (subject.type.find(([k,]) => k===field[0]))
                    typearray.push(field)
           }
           // TODO: index
           return ObjectType(typearray) 
        }
        return NeverType()
    }
    return { kind: 'ObjectType', type, index, isAssignable, isCallable, isIndexable, isAccessible, intersect, unionize }
}

export interface ArrayType extends TypeCheck {
    kind: 'ArrayType'
    type: Type
}

export function ArrayType(type: Type): ArrayType {
    let isAssignable = (subject: Type): boolean => {
        // TODO: handle rest operators
        if (subject.kind === 'ArrayType') return type.isAssignable(subject.type)
        if (subject.kind === 'TupleType') return subject.type.every(type.isAssignable)
        return false
    }
    let isCallable = NotCallable
    let isIndexable = type.isAssignable
    let isAccessible = NotAccessible
    let intersect = (subject: Type): Type => {
        if (subject.kind === 'ArrayType') {
            let elemtype = type.intersect(subject.type)
            if (elemtype.kind === 'NeverType') return NeverType()
            return ArrayType(elemtype)
        }
        return NeverType()
    }
    let unionize = (subject: Type, self: Type): Type => {
        if (subject.kind === 'ArrayType') {
            return ArrayType(type.unionize(subject.type))
        }
        return UnionType([self, subject])
    }
    return { kind: 'ArrayType', type, isAssignable, isCallable, isIndexable, isAccessible, intersect, unionize }
}

export interface TupleType extends TypeCheck {
    kind: 'TupleType'
    type: Type[]
}

export function TupleType(type: Type[]): TupleType {
    let isAssignable = (subject: Type): boolean => {
        // TODO: handle rest operators
        if (subject.kind === 'TupleType') return type.every((x, i) => x.isAssignable(subject.type[i]))
        if (subject.kind === 'ArrayType') return type.every(x => x.isAssignable(subject.type))
        return false
    }
    let isCallable = NotCallable
    let isIndexable = (subject: Type): boolean => {
        return (subject.kind === 'LiteralType' && subject.type.kind === 'NumberLiteral' && +subject.type.data < type.length)
    }
    let isAccessible = (field: string): Type|undefined => {
        // TODO: return true if field is number less than type.length
        return undefined
    }
    let intersect = (subject: Type, self: Type): Type => {
        self = self as TupleType
        if (subject.kind === 'TupleType') {
            if (subject.type.length !== self.type.length) return NeverType()
            let typearray = self.type.map((x, i) => x.intersect(subject.type[i]))
            if (typearray.some((x) => x.kind === 'NeverType')) return NeverType()
            return TupleType(typearray)
        }
        return NeverType()
    } 
    let unionize = (subject: Type, self: Type): Type => {
        self = self as TupleType
        if (subject.kind === 'TupleType') {
            // TODO
        }
        return UnionType([self, subject])
    }
    return { kind: 'TupleType', type, isAssignable, isCallable, isIndexable, isAccessible, intersect, unionize }
}

export interface FunctionType extends TypeCheck {
    kind: 'FunctionType'
    type: [Type[], Type]
}

export function FunctionType(type: [Type[], Type]): FunctionType {
    let isAssignable = (subject: Type): boolean => {
        if (subject.kind === 'FunctionType') {
            // typescript type checking allows type bivariance,
            return subject.type[0].every((x, i) => x.isAssignable(type[0][i]) || type[0][i].isAssignable(x))
        }
        return false
    }
    let isCallable = (subject: Type[]): boolean => {
      
        let args = type[0]
        return args.every((x, i) => x.isAssignable(subject[i]))
    }
    let isIndexable = NotIndexable
    let isAccessible = NotAccessible
    let intersect = (subject: Type): Type => {
        return NeverType() // TODO
    }
    let unionize = (subject: Type, self: Type): Type => {
        return UnionType([self, subject]) // TODO
    }
    return { kind: 'FunctionType', type, isAssignable, isCallable, isIndexable, isAccessible, intersect, unionize}
}

export type ComposedType =
    | UnionType
    | IntersectionType
    | OptionalType

export interface UnionType extends TypeCheck {
    kind: 'UnionType'
    type: Type[]
    toType(): Type
}

export function UnionType(type: Type[]): UnionType {
    let isAssignable = (subject: Type): boolean => {
        if (subject.kind === 'UnionType') {
            subject.type.every(x => type.some(y => y.isAssignable(x)))
        }
        return type.some(x => x.isAssignable(subject))
    }
    // superset of all unionized types(less specific, intersection of fields)
    var objectType: ObjectType
    let toType = (): Type => {
        if (objectType) return objectType
        var typearray: ObjectType['type'] = []
        // var typeindex: ObjectType['index'] // TODO
        let addToTypearray = (x: Type) => {
            if (x.kind === 'UnionType' || x.kind === 'IntersectionType' || x.kind === 'OptionalType') addToTypearray(x.toType())
            // if (x.kind === 'ArrayType') addToObject()
            // if (x.kind === )
            if (x.kind === 'ObjectType') {
                typearray = typearray ? typearray.flatMap(field => x.isAccessible(field[0]) ? [field] : [] )
                                      : x.type
            }
            // TODO: handle exception(primitive, literal, etc)
        }
        type.forEach(addToTypearray)
        objectType = ObjectType(typearray)
        return objectType
    }
    let isCallable = toType().isCallable
    let isIndexable = toType().isIndexable // always return false??
    let isAccessible = toType().isAccessible
    let intersect = (subject: Type): Type => {
        return NeverType() // TODO
    }
    let unionize = (subject: Type, self: Type): Type => {
        self = self as UnionType
        if (subject.kind === 'UnionType') return UnionType(self.type.concat(subject.type)) // TODO
        return UnionType(self.type.concat(subject))
    }
    return { kind: 'UnionType', type, isAssignable, isCallable, isIndexable, isAccessible, toType, intersect, unionize }
}

export interface IntersectionType extends TypeCheck {
    kind: 'IntersectionType'
    type: Type[]
    toType(): Type
}

export function IntersectionType(type: Type[]): IntersectionType {
    let isAssignable = (subject: Type): boolean => {
        return type.every(x => x.isAssignable(subject))
    }
    // subset of all intersect types(more specific, union of fields)

    let _toType = (types: Type[]): Type => {
        if (types.length == 1) return types[0]
        let first = types[0]
        let rest = _toType(types.slice(1))  
        switch ([first.kind, rest.kind]) {
        case ['PrimitiveType', 'PrimitiveType']:
            if ((first as PrimitiveType).type === (rest as PrimitiveType).type) return first
            else return NeverType()
        case ['ArrayType', 'ArrayType']: 
            if ((first as ArrayType).type === (rest as ArrayType).type) return first
        }

        return NeverType()
    }

    var objectType: ObjectType
    let toType = (): Type => {
        if (objectType) return objectType

        var typearray: ObjectType['type'] = []
        // var typeindex: ObjectType['index'] // TODO
        let addToTypearray = (x: Type) => {
            if (x.kind === 'UnionType' || x.kind === 'IntersectionType' || x.kind === 'OptionalType') addToTypearray(x.toType())
            // if (x.kind === 'ArrayType') addToObject()
            // if (x.kind === '')
            if (x.kind === 'ObjectType') {
                typearray = typearray.concat(x.type.flatMap(field => x.isAccessible(field[0]) ? [] : [field] ))
            }
            // TODO: handle exception(primitive, literal, etc)
        }
        type.forEach(addToTypearray)
        objectType = ObjectType(typearray)
        return objectType 
    }
    let isCallable = toType().isCallable
    let isIndexable = toType().isIndexable // always return false??
    let isAccessible = toType().isAccessible
    let intersect = (subject: Type, self: Type): Type => {
        self = self as IntersectionType
        if (subject.kind === 'IntersectionType') return IntersectionType(self.type.concat(subject.type))
        return IntersectionType(self.type.concat(subject))
    }
    let unionize = (subject: Type, self: Type): Type => {
        return UnionType([subject, self])
    }
    return { kind: 'IntersectionType', type, isAssignable, isCallable, isIndexable, isAccessible, toType, intersect, unionize }
}

export interface OptionalType extends TypeCheck {
    kind: 'OptionalType'
    type: Type
    toType(): Type
}

export function OptionalType(type: Type): OptionalType {
    // optional type takes either the underlying type or undefined
    let isAssignable = (subject: Type) => {
        if (subject.kind === 'PrimitiveType' && subject.type === 'UndefinedType') return true
        return type.isAssignable(subject)
    }
    let isCallable = type.isCallable
    let isIndexable = type.isIndexable
    let isAccessible = type.isAccessible
    let toType = () => type
    let intersect = (subject: Type): Type => {
        return OptionalType(subject.intersect(type)) // TODO
    }
    let unionize = (subject: Type): Type => {
        return OptionalType(subject.unionize(type)) // TODO
    }
    return { kind: 'OptionalType', type, isAssignable, isCallable, isIndexable, isAccessible, toType, intersect, unionize }
}


/*
export function NewType(env: Env, ty: Type): TypePointer {
    const typeptr = env.typedefs.push(ty)
    return { kind: 'TypePointer', id: typeptr }
}

export function GetType(env: Env, ptr: TypePointer): Type {
    return env.typedefs[ptr.id]
}

// Conceptually **ptr = ty
function SetType(env: Env, ptr: TypePointer, ty: Type): Type {
    env.typedefs[ptr.id] = ty
    return ty
}

// Conceptually *lptr = *rptr
function AssignType(env: Env, lptr: TypePointer, rptr: TypePointer) {
    // This should change all the current reference to this lptr.
    // I'm not sure if js works in this way? maybe? 
    lptr.id = rptr.id
}

function NewUndefinedType(env: Env): TypePointer {
    return NewType(env, { kind: 'LiteralType', type: 'UndefinedType' })
}

export type ComplexType =
    | UnionType
    | ArrayType
    | TupleType
    | ObjectType
    | FunctionType
    | AnyType

export interface UnionType {
    kind: 'UnionType';
    type: TypePointer[];
}

export interface ArrayType {
    kind: 'ArrayType';
    type: TypePointer;
}

export interface TupleType {
    kind: 'TupleType';
    type: TypePointer[];
}

export interface ObjectType {
    kind: 'ObjectType';
    type: {[key: string]: TypePointer}
}

export interface FunctionType {
    kind: 'FunctionType';
    name?: string;
    argtype: TypePointer[];
    type: TypePointer;
}

export interface AnyType {
    kind: 'AnyType';
    type: TypePointer;
}

export interface VoidType {
    kind: 'VoidType';
}

export interface TypePointer {
    kind: 'TypePointer';
    id: number;
}

// env has indirect type mapping inside
// varname => typename => typeptr => type
// so we can modify typeptr once to reflect all the type changes for the synonyms
// 
// i dont think we need explicit pointer-style access here
// in js objects are shared by default
export interface Env {
    kind: 'Env';
    typeof: {[key: string]: string} // varname => typename
    typeptr: {[key: string]: TypePointer} // typename => typeptr
    typedefs: Type[] // typeptr => type
}

function unifyArrayType(env: Env,
    array1: ArrayType,
    array2: ArrayType,
): (TypePointer|undefined) {
    var ptr = unify(env, array1.type, array2.type)
    return ptr ? NewType(env, { kind: 'ArrayType', type: array1.type }) : undefined
}

function unifyTupleType(env: Env, 
    tuple1: TupleType,
    tuple2: TupleType,
): (TypePointer|undefined) {
    var result = { kind: 'TupleType', type: [] } as TupleType

    if (tuple1.type.length !== tuple2.type.length) {
        return undefined
    }

    for (var i = 0; i < tuple1.type.length; i++) {
        const typename1 = tuple1.type[i]
        const typename2 = tuple2.type[i]
        const unifiedType = unify(env, typename1, typename2)
        if (!unifiedType) return undefined
        result.type.push()
    }
    return NewType(env, result)
}

function zipObject(object1: {[key: string]: TypePointer}, object2: {[key: string]: TypePointer}): [string, TypePointer?, TypePointer?][] {
    var entries1 = Object.entries(object1).sort(([k1,], [k2,]) => k1<k2?-1:k1===k2?0:1)
    var entries2 = Object.entries(object2).sort(([k1,], [k2,]) => k1<k2?-1:k1===k2?0:1) 
    
    var result = [] as [string, TypePointer?, TypePointer?][]

    const FieldName = 0
    const FieldType = 1
    while (entries1.length !== 0 && entries2.length !== 0) {
        const entry1 = entries1[0]
        const entry2 = entries2[0]
        if (entry1[FieldName] === entry2[FieldName]) {
            result.push([entry1[FieldName], entry1[FieldType], entry2[FieldType]])
            entries1 = entries1.slice(1)
            entries2 = entries2.slice(1)
        } 
        else if (entry1[FieldName]<entry2[FieldName]) {
            result.push([entry1[FieldName], entry1[FieldType], undefined])
            entries1 = entries1.slice(1)
        }
        else {
            result.push([entry2[FieldName], undefined, entry2[FieldType]])
            entries2 = entries2.slice(1)
        }
    }

    if (entries1.length !== 0) {
        for (var i = 0; i < entries1.length; i++) {
            result.push([entries1[i][FieldName], entries1[i][FieldType], undefined])
        }
    }
    if (entries2.length !== 0) {
        for (var i = 0; i < entries2.length; i++) {
            result.push([entries1[i][FieldName], undefined, entries2[i][FieldType]])
        }
    }

    return result
}

function unifyObjectType(env: Env,
    object1: ObjectType,
    object2: ObjectType,
): (TypePointer|undefined) {
    var result = { kind: 'ObjectType', type: {} } as ObjectType
 
    var typepairs = zipObject(object1.type, object2.type)

    for (const [fieldname, fieldptr1, fieldptr2] of typepairs) {
        if (!fieldptr1 || !fieldptr2) return undefined // TODO: might be optional
        const ptr = unify(env, fieldptr1, fieldptr2)
        AssignType(env, fieldptr1, ptr)
        AssignType(env, fieldptr2, ptr)
    }

    return NewType(env, result)
}

function unifyUnionType(env: Env,
    union1: UnionType,
    union2: UnionType,
): (TypePointer|undefined) {
    var result = { kind: 'UnionType', type: [] } as UnionType


}

// extendType returns the minimal type that satisfies both type
export function extendType(env: Env, typename1: string, typename2: string): (TypePointer|undefined) {

}

// unify returns the maximum type that satisfies both type
export function unify(env: Env, typeptr1: TypePointer, typeptr2: TypePointer): (TypePointer|undefined) {
    if (typeptr1 === typeptr2) return typeptr1

    var type1 = env.typedefs[typeptr1.id]
    var type2 = env.typedefs[typeptr2.id]    

    if (type1.kind === 'LiteralType' && type2.kind === 'LiteralType') {
        switch ([type1.type, type2.type]) {
        case ['StringType', 'StringType']: return typeptr1 
        case ['BooleanType', 'BooleanType']: return typeptr1
        case ['NumberType', 'NumberType']: return typeptr1
        case ['BigintType', 'BigintType']: return typeptr1
        case ['NullType', 'NullType']: return typeptr1
        case ['UndefinedType', 'UndefinedType']: return typeptr1
        case ['VoidType', 'VoidType']: return typeptr1 // TODO: check if right. void should be discarded.
        }
    }

    if (type2.kind === 'LiteralType') {
        return unify(env, typeptr2, typeptr1)
    }

    if (type1.kind === 'LiteralType') {
        switch (type2.kind) {
        case 'AnyType':
            AssignType(env, typeptr2, typeptr1)
            return typeptr1
        case 'UnionType': 
            return unifyUnionType(env, { kind: 'UnionType', type: [type1] }, type2 as UnionType)
        default: 
            return undefined
        }
    }

    type1 = type1 as ComplexType 
    type2 = type2 as ComplexType

    var ptr: TypePointer

    switch ([type1.kind, type2.kind]) {
    case ['ArrayType', 'ArrayType']:
        ptr = unifyArrayType(env, type1 as ArrayType, type2 as ArrayType)
    case ['TupleType', 'TupleType']:
        ptr = unifyTupleType(env, type1 as TupleType, type2 as TupleType)
    case ['ObjectType', 'ObjectType']:
        ptr = unifyObjectType(env, type1 as ObjectType, type2 as ObjectType)
    case ['FunctionType', 'FunctionType']:
        ptr = unifyFunctionType(env, type1 as FunctionType, type2 as FunctionType)
    case ['UnionType', 'UnionType']:
        ptr = unifyUnionType(env, type1 as UnionType, type2 as UnionType)
    }

    if (!ptr) return undefined

    SetTypePointer(env, typename1, ptr)
    SetTypePointer(env, typename2, ptr)

     // TODO: any
}

// narrowVar returns the maximum type of variable that satisfies type
export function narrowVar(env: Env, type: Type, variable: string): (Type|null) {

}

// 
*/