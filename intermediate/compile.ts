import * as form from './intermediate_form';

// internally, datatypes are classified into
// - raw integer(i64)
// - big integer(memory allocated)
// - boolean(i32)
// - null(const null)
// - string(memory allocated)
// - array(memory allocated, inherits object)
// - map-object(memory allocated)
// - struct-object(memory allocated)
// - record-object(memory allocated)
// - closure(memory allocated)

export function CompileExpr(expr: Expr) {

}