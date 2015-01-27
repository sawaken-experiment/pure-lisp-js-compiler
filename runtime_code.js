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
