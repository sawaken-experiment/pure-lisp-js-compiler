var Failed = {failed: true};
var Parsed = function(a, b){ return {parsed: a, rest: b}; };
var Cons = function(head, tail){ return {head: head, tail: tail}; };
var Empty = {empty: true};
var Unit = {};

var toInp = function(str){
  return str.length === 0 ? Empty : Cons(str[0], toInp(str.slice(1)));
};

var isBetween = function(a, b){ return function(c){ return a <= c && c <= b; }; };
var isDigit = isBetween('0', '9');
var isLower = isBetween('a', 'z');
var isUpper = isBetween('A', 'Z');
var isAlpha = function(c){ return isLower(c) || isUpper(c); };
var isAlphaNum = function(c){ return isAlpha(c) || isDigit(c) || c === '.'; };
var isChar = function(x){ return function(c){ return c === x; }; };
var isSpace = function(c){ return c === ' ' || c === '\n' || c === '\t'; };


var parse = function(parser, inp){ return parser(inp); };
var ret = function(v){ return function(inp){ return Parsed(v, inp); }; };
var failure = function(inp){ return Failed; };
var item = function(inp){ return inp.empty ? Failed : Parsed(inp.head, inp.tail); };
var then = function(parser, f){
  return function(inp){
    var res = parse(parser, inp);
    return res.failed ? Failed : parse(f(res.parsed), res.rest);
  };
};
var or = function(p, q){
  return function(inp){
    var res = parse(p, inp);
    return res.failed ? parse(q, inp) : res;
  };
};
var sat = function(p){
  return then(item, function(x){
    return p(x) ? ret(x) : failure;
  });
};
var digit = sat(isDigit);
var lower = sat(isLower);
var upper = sat(isUpper);
var letter = sat(isAlpha);
var alphanum = sat(isAlphaNum);
var ch = function(x){ return sat(isChar(x)); };
var string = function(m){
  if (m.empty) return ret(m);
  return then(ch(m.head), function(){
    return then(string(m.tail), function(){
      return ret(m);
    });
  });
};
var many = function(p){ return or(many1(p), ret(Empty)); };
var many1 = function(p){
  return then(p, function(v){
    return then(many(p), function(vs){
      return ret(Cons(v, vs));
    });
  });
};
var ident = many1(alphanum);
var nat = then(many1(digit), function(xs){
  return ret({nat: xs});
});
var space = then(many(sat(isSpace)), function(){
  return ret(Unit);
});
var token = function(p){
  return then(space, function(){
    return then(p, function(v){
      return then(space, function(){
	return ret(v);
      });
    });
  });
};
var identifier = token(ident);
var natural = token(nat);
var symbol = function(xs){ return token(string(xs)); };
var form = function(command, p, r){
  return then(symbol(toInp("(")), function(){
    return then(symbol(toInp(command)), function(){
      return then(p, function(t){
	return then(symbol(toInp(")")), function(){
	  return ret(r ? r(t) : t);
	});
      });
    });
  });
};
var list = function(content){
  return then(symbol(toInp("(")), function(){
    return then(many(content), function(xs){
      return then(symbol(toInp(")")), function(){
	return ret(xs);
      });
    });
  });
};
var quote = then(symbol(toInp("(")), function(){
  return then(symbol(toInp("quote")), function(){
    return then(exp, function(e){
      return then(symbol(toInp(")")), function(){
	return ret({quoted: e});
      });
    });
  });
});
var lambda = form("lambda", then(list(identifier), function(ps){
  return then(many1(exp), function(es){
    return ret({lambda: true, params: ps, exps: es});
  });
}));
var condition = then(symbol(toInp("(")), function(){
  return then(exp, function(ce){
    return then(exp, function(e){
      return then(symbol(toInp(")")), function(){
	return ret({condition:ce, exp:e});
      });
    });
  });
});
var cond = form("cond", many1(condition), function(cs){ return {cond: true, conditions: cs}; });
var define = form("define", then(identifier, function(ident){
  return then(exp, function(e){
    return ret({define: true, identifier: ident, exp: e});
  });
}));
var specialExp = or(quote, or(lambda, or(cond, define)));
var normalExp = or(natural, identifier);
var aexp = or(specialExp, normalExp);
var sexp = then(symbol(toInp("(")), function(){
  return then(many1(or(aexp, sexp)), function(xs){
    return then(symbol(toInp(")")), function(){
      return ret(xs);
    });
  });
});
var exp = or(aexp, sexp);

module.exports = {
  process: function(lispCode){
    return parse(many1(exp), toInp(lispCode));
  }
}
