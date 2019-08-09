'use strict';

const sequences = [
  function*(){
    let i = 2;
    let a = 1;

    yield 1;

    while(1){
      const g = gcd(i, a);

      if(g === 1) yield a += i + 1;
      else yield a /= g;

      i++;
    }
  },

  function*(){
    let a = 2;

    while(1){
      yield a - parseInt(a.toString(2).split('').reverse().join(''), 2) + 1e5;
      a = nextPrime(a);
    }
  },
];

const gcd = (a, b) => {
  if(b > a){
    let t = a;
    a = b;
    b = t;
  }

  while(b !== 0){
    let t = a;
    a = b;
    b = t % b;
  }

  return a;
};

const isPrime = a => {
  if(a === 1) return 0;

  const b = Math.sqrt(a) | 0;
  for(let i = 2; i <= b; i++)
    if(a % i === 0) return 0;

  return 1;
};

const nextPrime = a => {
  while(!isPrime(++a));
  return a;
};

module.exports = sequences;