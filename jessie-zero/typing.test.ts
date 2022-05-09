import * as typing from './typing'

function testAssignable(target: typing.Type, subject: typing.Type, expected: boolean) {
    if (expected) {
        expect(target.isAssignable(subject)).toBeTruthy()
    } else {
        expect(target.isAssignable(subject)).toBeFalsy()
    }
}

test('Number is assignable to Number', () => {
    testAssignable(typing.NumberType(), typing.NumberType(), true)
})

test('Boolean is assignable to Boolean', () => {
    testAssignable(typing.BooleanType(), typing.BooleanType(), true)
})

test('Number is not assignable to Boolean', () => {
    testAssignable(typing.BooleanType(), typing.NumberType(), false)
})

test('Array of numbers is assignable to Array of numbers', () => {
    testAssignable(
        typing.ArrayType(typing.NumberType()), 
        typing.ArrayType(typing.NumberType()), 
        true,
    )
})

test('Array of numbers is not assignable to Array of booleans', () => {
    testAssignable(
        typing.ArrayType(typing.BooleanType()), 
        typing.ArrayType(typing.NumberType()), 
        false,
    )
})
    
 
test('Tuple of [number, boolean] is assignable to Tuple of [number, boolean]', () => {
    testAssignable(
        typing.TupleType([typing.NumberType(), typing.BooleanType()]), 
        typing.TupleType([typing.NumberType(), typing.BooleanType()]), 
        true,
    )
})

test('Tuple of [number, boolean] is not assignable to Tuple of [number, number]', () => {
    testAssignable(
        typing.TupleType([typing.NumberType(), typing.BooleanType()]), 
        typing.TupleType([typing.NumberType(), typing.NumberType()]), 
        false,
    )
})

test('Tuple of [number, number] is assignable to Array of numbers', () => {
    testAssignable(
        typing.ArrayType(typing.NumberType()),
        typing.TupleType([typing.NumberType(), typing.NumberType()]),
        true
    )
})

test('Tuple of [number, boolean] is not assignable to Array of numbers', () => {
    testAssignable(
        typing.ArrayType(typing.NumberType()),
        typing.TupleType([typing.NumberType(), typing.BooleanType()]),
        false
    )
})

test('Object of {} is not assignable to {name: string}', () => {
    testAssignable(
        typing.ObjectType([['name', typing.StringType()]]),
        typing.ObjectType([]),
        false,
    )
})

test('Object of {name: string} is assignable to {name: string}', () => {
    testAssignable(
        typing.ObjectType([['name', typing.StringType()]]),
        typing.ObjectType([['name', typing.StringType()]]),
        true,
    )
})

test('Object of {name: string, hobby: string} is assignable to {name: string}', () => {
    testAssignable(
        typing.ObjectType([['name', typing.StringType()]]),
        typing.ObjectType([['name', typing.StringType()], ['hobby', typing.StringType()]]),
        true,
    )
})

test('Type of number is assignable to Union of number|boolean', () => {
    testAssignable(
        typing.UnionType([typing.NumberType(), typing.BooleanType()]),
        typing.NumberType(),
        true,
    )
})

test('Type of numbe|boolean is assignable to Union of number|boolean', () => {
    testAssignable(
        typing.UnionType([typing.NumberType(), typing.BooleanType()]),
        typing.UnionType([typing.NumberType(), typing.BooleanType()]),
        true,
    )
})

test('Type of number|boolean|string is not assignable to Union of number|boolean', () => {
    testAssignable(
        typing.UnionType([typing.NumberType(), typing.BooleanType()]),
        typing.UnionType([typing.NumberType(), typing.BooleanType(), typing.StringType()]),
        false,
    )
})