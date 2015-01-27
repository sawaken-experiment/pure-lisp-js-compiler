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

module.exports = {
  compile: function(lispCode){
    var parsed = parser.process(lispCode);
    if (parsed.failed) {
      return undefined;
    } else {
      var compiled = escodegen.generate({ type: 'Program', body: compileBody(parsed.parsed) });
      return require("fs").readFileSync("./runtime_code.js", "ascii") + compiled;
    }
  }
}

  
  

