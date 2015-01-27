var escodegen = require('escodegen');
var parser = require('./parser.js');

// ** functional util **
var Cons = function(head, tail){ return {head: head, tail: tail}; };
var Empty = {empty: true};

var len = function(list){ return list.empty ? 0 : 1 + len(list.tail); };
var charListToStr = function(cl){
  return cl.empty ? "" :  cl.head + charListToStr(cl.tail);
};
var charListToInt = function(cl){
  return parseInt(charListToStr(cl));
};
var listToArray = function(list){
  return list.empty ? [] : [list.head].concat(listToArray(list.tail));
};
var isCharList = function(list){
  return all(function(obj){ return typeof(obj) === "string"; })(list);
};
var map = function(f){
  var m = function(list){
    return list.empty ? Empty : Cons(f(list.head), m(list.tail));
  };
  return m;
};
var foldl = function(f){
  return function(init){
    return function(list){
      var _foldl = function(list, acc){
	return list.empty ? acc : _foldl(list.tail, f(list.head, acc));
      };
      return _foldl(list, init);
    };
  };
};
var all = function(p){
  return foldl(function(a, acc){ return p(a) ? acc : false; })(true);
};
var take = function(n){
  return function(list){
    var take_ = function(i, list){
      return i === 0 ? Empty : Cons(list.head, take_(i - 1, list.tail));
    };
    return take_(n, list);
  };
};
var drop = function(n){
  return function(list){
    var drop_ = function(i, list){
      return i === 0 ? list : drop_(i - 1,  list.tail);
    };
    return drop_(n, list);
  };
};
// -----------------------------------------------


var compileLambdaBody = function(tree_list){
  var last_tree = drop(len(tree_list) - 1)(tree_list).head;
  var last_removed = take(len(tree_list) - 1)(tree_list);
  return compileBody(last_removed).concat([{
    type: 'ReturnStatement',
    argument: compileExp(last_tree)}]);
};

var compileBody = function(tree_list){
  return listToArray(map(function(tree){ return {
    type: 'ExpressionStatement',
    expression: compileExp(tree)};})(tree_list));
};

var compileQuote = function(tree){
  if (tree.nat) return {
    type: 'Literal',
    value: charListToInt(tree.nat)
  };

  if (typeof(tree) === "object" && isCharList(tree)) return {
    type: 'Literal',
    value: charListToStr(tree)
  };

  if (typeof(tree) === "object") return {
    type: 'ObjectExpression',
    properties: [
      { type: 'Property',
        key: { type: 'Identifier', name: 'car' },
        value: compileQuote(tree.head),
        kind: 'init' },
      { type: 'Property',
        key: { type: 'Identifier', name: 'cdr' },
        value:  compileQuote(tree.tail),
        kind: 'init'
      }
    ]
  };
  return {};
};

var compileExp = function(tree){

  if (tree.nat) return {
    type: 'Literal',
    value: charListToInt(tree.nat)
  };

  if (tree.quoted) return compileQuote(tree.quoted);

  if (tree.lambda) return {
    type: 'FunctionExpression',
    params: listToArray(map(compileExp)(tree.params)),
    body: {
      type: 'BlockStatement',
      body: compileLambdaBody(tree.exps)
    }
  };

  if (tree.cond) {
    if (tree.conditions.empty) return {
      type: 'Identifier',
      value: 'undefined'
    };
    return {
      type: 'ConditionalExpression',
      test: compileExp(tree.conditions.head.condition),
      consequent: compileExp(tree.conditions.head.exp),
      alternate: compileExp({cond: true, conditions: tree.conditions.tail})
    };
  }

  if (tree.define) return {
    type: 'AssignmentExpression',
    operator: '=',
    left: compileExp(tree.identifier),
    right: compileExp(tree.exp)
  };

  if (isCharList(tree)) return {
    type: 'Identifier',
    name: charListToStr(tree)
  };

  var astList = map(compileExp)(tree);

  return {
    type: 'CallExpression',
    callee: astList.head,
    arguments: listToArray(astList.tail)
  }
};


function atom(a) { return typeof(a) !== "object"; }
function eq(a, b) { return a === b; }
function car(obj) { return obj.car; }
function cdr(obj) { return obj.cdr; }
function cons(a, b) { return {car:a, cdr:b}; }
function add(a, b) { return a + b; }
function sub(a, b) { return a - b; }
function mul(a, b) { return a * b; }
function div(a, b) { return a / b; }
function display(ls) {
  var toStr = function(ls, first, last, bottom) {
    if (first && last) {
      return "()";
    } else if (last) {
      return ")";
    } else if (bottom) {
      return ls.toString();
    } else {
      var a = car(ls);
      var carStr = toStr(a, !atom(a), !atom(a) && atom(cdr(a)), atom(a));
      var cdrStr = toStr(cdr(ls), false, atom(cdr(ls)));
      return (first ? "(" : " ") + carStr + cdrStr;
    }
  }
  if (atom(ls)) {
    console.log(toStr(ls, false, false, true));
  } else {
    console.log(toStr(ls, true, atom(cdr(ls)), false));
  }
}

function appendRuntimeCode(compiledCode){
  var builtinFuncs = [atom, eq, car, cdr, cons, add, sub, mul, div, display];
  var stringExpression = builtinFuncs.map(function(f){ return f.toString(); }).join('\n');
  return stringExpression + '\n' + compiledCode;
}

module.exports = {
  compile: function(lispCode){
    var parsed = parser.process(lispCode);
    if (parsed.failed) {
      return undefined;
    } else {
      var compiled = escodegen.generate({ type: 'Program', body: compileBody(parsed.parsed) });
      return appendRuntimeCode(compiled);
    }
  }
}

  
  

