const data1 = `
const $x: number = 3;
const $y: number = 4;
const $f: (number, number) => number = ($a, $b) => $a+$b;
const $main: () => number = () => f($x, $y)
` 

test('data 1 compiles', () => {
    expect(parse(data1).run()).toBeEqual(7)
}) 