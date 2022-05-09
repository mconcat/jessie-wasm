import * as ast from '../jessie-zero/ast';
import * as typing from '../jessie-zero/typing'
import * as inf from '../jessie-zero/inference'

// internally, datatypes are classified into
// - raw integer(i64)
// - big integer(memory allocated)
// - boolean(i32)
// - null(const null)
// - string(memory allocated)
// - pointer array(memory allocated, inherits object)
// - i8 packed array
// - i64 packed array
// - map-object(memory allocated)
// - struct-object(memory allocated)
// - closure(memory allocated)

// internal types

// pointer values are truncated into i32 using i32.wrap_i64

// raw values:
// pointer values: 
// [1, 1, tag: [u8; 5], [0; 13], address: [u8; 48]]

// typename
// stack: stack prefix tag, valid value range
// pointer: pointer prefix tag, valid value range
// memory layout: layout in memory
// proto: protobuf encoding 
// json: json encoding

// integer/literal types pointer tag starts with 1100, 1100

// integer
// stack: 0, -2^62-2^62
// pointer: 1100000, -2^63-2^63
// memory layout: i64
// proto: varint
// json: number

// boolean:
// stack: 1100010, 1100011
// pointer: *
// memory layout: i8
// proto: varint
// json: boolean

// null
// stack: 1100100
// pointer: *
// memory layout: *
// proto: null message(empty bytes)
// json: null

// undefined
// stack: 1100101
// pointer: *
// memory layout: *
// proto: null message(empty bytes)
// json: (empty field)

// v128 integer
// stack: *
// pointer: 110010, -2^127-2^127
// memory layout: v128
// proto: repeated fixed64
// json: string integer

// big integer
// stack: *
// pointer: 110011, -2^255-2^255
// memory layout: i64, i64, i64, i64
// proto: repeated fixed64
// json: string integer

// array types pointer tag starts with 1101

// string
// stack: *
// pointer: 1101000, i32 ptr
// memory layout: (i32, [i8])
// proto: bytes
// json: string

// i8 packed array
// stack: *
// pointer: 1101001
// memory layout: (i32, [i8])
// proto: bytes
// json: hex string

// value array
// stack: *
// pointer: 1101010
// memory layout: (i32, [i64])
// proto: repeated fixed64
// json: object array

// object types pointer tag starts with 1110

// literal object
// stack: *
// pointer: 1110000
// memory layout: (i32, [i64])

// foreign object(global)
// stack: *
// pointer: 1110100
// memory layout: ()

// closure types pointer tag start with 1111

// literal closure
// stack: *
// pointer: 1111000
// memory layout: ()

// function pointer
// stack: *
// pointer: 1111001

// foreign closure(func)
// stack: *
// pointer: 1111100
// memory layout: ()


export function CompileExpr(expr: inf.TypedExpr): {

}