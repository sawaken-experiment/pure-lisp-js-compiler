var compiler = require('./compiler.js');
var fs = require("fs");

var input_file = process.argv[2];
var code = fs.readFileSync(input_file, "utf8");
var compiledCode = compiler.compile(code);

if (!compiledCode) {
  console.log("Compile Error\n");
} else {
  fs.writeFile("out.js", compiledCode);
}

