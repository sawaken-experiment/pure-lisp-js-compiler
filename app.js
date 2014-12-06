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

var compile = function(lispCode){
  return appendBuiltinFuncs(compiler.compile(lispCode));
}

console.log(compile(lispcode));
