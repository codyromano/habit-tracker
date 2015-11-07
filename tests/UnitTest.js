var proto = UnitTest.prototype; 

proto.PASSED = 1; 
proto.PENDING = 0;
proto.FAILED = -1; 

function UnitTest(title) {
  this.title = title;
  this.assertions = [];
}

proto.run = function(assertion) {
  try {
    assertion.result = assertion.testFn();
    assertion.status = (assertion.result === assertion.expectedVal) ? 
      proto.PASSED : proto.FAILED;
  } catch (e) {
    assertion.exception = e;
    assertion.status = proto.FAILED;
  }
  return assertion;
};

proto.runAll = function() {
  return this.assertions.map(this.run); 
};

proto.reportAll = function() {
  console.log(''); 

  var tests = this.runAll();
  var total = tests.length;
  var passed = tests.filter(function(test) {
    return test.status === proto.PASSED;
  }).length;
  var failed = total - passed;

  console.log('');
  console.log('UNIT TEST %s (%s/%s passed)', this.title, passed, total);
  console.log('');

  if (failed > 0) {
    tests.forEach(this.reportFailure);
    throw new Error('Unit test FAILED: ' + this.title);
  }
  console.log('');
};

proto.reportFailure = function(assertion) {
  if (assertion.status !== proto.PASSED) {
    console.error('Assertion Failed: %s', assertion.title);
    console.error('Expected: ', assertion.expectedVal);
    console.error('Received: ',assertion.result);
    if (assertion.exception) {
      console.error('EXCEPTION: ', assertion.exception);
    }
    console.log('');
    console.log('');
  }
};

proto.assert = function(title, testFn, expectedVal) {
  expectedVal = (expectedVal === undefined) ? true : expectedVal;

  this.assertions.push({
    testFn: testFn,
    title: title,
    expectedVal: expectedVal,
    status: proto.PENDING,
    result: null
  });
};

module.exports = UnitTest;
