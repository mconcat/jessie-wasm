# IR

Intermediary representation for multiple languages that compiles into wasm

## Types

### Number

Number is i64-representable data that is either signed or unsigned.

#### Raw Number

Raw number is represented as `i64`. 

#### Boxed Number

Boxed number is represented as `i32` with prefix `1000`. `i64` in memory.

### Bigint

Bigint is i256-representable data that is either signed or unsigned.

#### Raw Bigint

Raw bigint is represented as either `v128` or `v128, v128`

### String

String is an immutable byte array. 

### Boolean

### Null

Null is the only value of `null` type. It is represented as `const.null` as raw value. It is represented as prefix ``

### Undefined

Undefined value is represented as `i32` nil pointer(pointer value pointing address 0).

### Array

#### Raw Array

#### Annotated Array

#### Boxed Array

### Object

#### Raw Object

#### Annotated Object

#### Boxed Object