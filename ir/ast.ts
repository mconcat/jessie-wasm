// StructMetadata defines the compiletime-known object
// StructMetadata is stored under global section of the wasm code
export interface StructMetadata {

}

// Struct is a compiletime-known object 
export interface Struct {
    metadata: StructMetadata

}

export type Expression = 
    | ArithmeticExpression
    | AssignmentExpression
    | DeclarationExpression
    | ConditionalExpression
    | LoopExpression
    | BranchExpression
    | CallExpression
    | PropertyExpression

export interface Module {

}