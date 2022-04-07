# Jessie-Wasm

Compiler from Jessie, a secure subset of Javascript, to Wasm, a fast and secure virtual machine.

## Goal

Jessie-Wasm is designed for using Jessie as a frontend language for Cosmwasm. Rust, a cosmwasm frontend language, it not very contract developer friendly, compared to languages like solidity which has low entry barrier. Jessie is developed by Agoric team and is a strict and secure subset of javascript, meaning all Jessie code are also a valid Javascript code. Also Jessie is being used on Agoric blockchain as their primary contracting language. Unlike Agoric runtime, majority of SDK-based blockchains, including Osmosis, are completely golang based, and cannot afford a javascript runtime on its chain logic. Instead they use Cosmwasm, a Wasm based contract runtime. By providing a compiler from Jessie to Wasm, we hope to attract more developers into Cosmos contract environment.

## Design decision

### Jessie 

- Make it completely compatible with the canonical Jessica parser, with some exceptions that is neccesary for compiling into Wasm(like type annotations), and some cosmwasm incompatible features.
- To make modification easily the parser and ast traverse logic will be written from scratch, with typescript-parsec and emscripten, respectively.
- Runtime datatypes will be either i64, bigint, array, object. Integer literals are compiled into i64. Bigint literals and decimals are compiled into bigint(four-tuple of i64), with a predefined precision. Arrays and objects are compiled into runtime reference objects(TODO: should we make the representation of reference objects to match with rusts'?)
