function foo(bar) { 
	console.log("hello: " + bar); 
	bar = "foo"; 
}

var a = "bar";

foo(a);

foo(a);
