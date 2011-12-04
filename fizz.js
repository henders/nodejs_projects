function fizzBuzz(maxValue) {
	for (var i = 1; i <= maxValue; i++) {
		(!(i % 3) && !(i % 5) && !console.log('FizzBuzz:')) ||
		(!(i % 3) && !console.log('Fizz:')) ||
		(!(i % 5) && !console.log('Buzz:')) ||
		console.log(i);
	}
}

//------------------------------------------------------------------

function getNextPrime(start) {
	var isPrime = false;

	// start incrementing start
	for (start++; ; start++) {
		// check primeness
		isPrime = true;
		for (var i = 2; i < start && isPrime; i++) {
			if (!(start % i)) {
				isPrime = false;
			}
		}

		if (isPrime) return start;
	}
	return -1;
}

function doubleSquare(maxValue) {
	var results = [];
	for (var i = 2; ; i = getNextPrime(i)) {
		if ((i * i * i * i) > maxValue) {
			break;
		}
		for (var j = i; ; j = getNextPrime(j)) {
			total = i * i * j * j;
			if (total > maxValue) {
				break;
			}
			results.push(total);
		}
		total = 0;
	}

	results = results.sort(function(a,b) { return (a - b);});
	results.forEach(function(item) { console.log(item); });
}

//------------------------------------------------------------------

var factorial = function() {
	var facts = [0,1];

	return function fac(val) {
		if (!facts[val]) {
			facts[val] = val * fac(val - 1);
		}
		return facts[val];
	};
}();

function factoradic(val) {
	// find max factoroid for the value
	var fact = 0,
			multiplier = 0,
			currentFactoid = 0,
			newMult = multiplier,
			newFact = fact,
			factArray = [0];

	while (val > 0) {
		fact = 0;
		multiplier = 1;
		currentFactoid = 0;
		while (currentFactoid < val)
		{
			if (typeof factArray[fact] === 'undefined')
				factArray[fact] = 0;
			newMult = multiplier + 1;
			newFact = fact;
			if (newMult > fact) {
				newFact += 1;
				newMult = 1;
			}
			var newCurrentFactoid = factorial(newFact) * newMult;
			if (newCurrentFactoid > val) {
				break;
			}
			fact = newFact;
			multiplier = newMult;
			currentFactoid = newCurrentFactoid;
		}
		val -= currentFactoid;
		factArray[fact] = multiplier;
	}
	return factArray.reverse().join('');
}

function printFactoids() {
	for (var i = 0; i <= 1000; i++) {
		console.log(i + ":" + factoradic(i));
	};
}
printFactoids();
