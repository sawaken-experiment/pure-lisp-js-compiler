var compiler = require('./compiler.js');

var lispcode = "(define map (lambda (f ls) (cond ((atom ls) ls) (1 (cons (f (car ls)) (map f (cdr ls))))))) (map (lambda (a) (add a 1)) (quote (1 2 3)))";

function atom(a){ return typeof(a) !== "object"; }
function eq(a, b){ return a === b; }
function car(obj){ return obj.car; }
function cdr(obj){ return obj.cdr; }
function cons(a, b){ return {car:a, cdr:b}; }
function add(a, b){ return a + b; }
function sub(a, b){ return a - b; }
function mul(a, b){ return a * b; }
function div(a, b){ return a / b; }

var appendBuiltinFuncs = function(compiledCode){
  var builtinFuncs = [atom, eq, car, cdr, cons, add, sub, mul, div].map(function(f){ return f.toString(); }).join('\n');
  return builtinFuncs + '\n' + compiledCode;
}

while (true) {
  var stdin = require("fs").readFileSync("/dev/stdin", "utf8");
  var mainCode = compiler.compile(stdin);
  if (!mainCode) {
    console.log("Compile Error\n");
  } else {
    console.log(appendBuiltinFuncs(mainCode));
  }
}
