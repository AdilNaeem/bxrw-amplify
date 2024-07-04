import { PunchList } from './PunchList.js';

class Results {
  constructor() {
    this.errors = 0;
    this.success = 0;
  }

  addError(mess) {
    this.errors += 1;
    console.log(`ERROR: ${mess}`);
  }

  addSuccess() {
    this.success += 1;
  }

  report() {
    console.log(`Success: ${this.success}, Error: ${this.errors}`);
    if (this.errors == 0) {
      console.log("SUCCESS");
    } else {
      console.log("ERRORS");
    }
  }
}

let results = new Results();

// Test 1
var punchList = new PunchList();
if (punchList.hasOpenPunch) {
    results.addError("new PunchList has open punch");
} else {
    results.addSuccess();
}

// Test 2
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
if (!punchList.hasOpenPunch) {
    results.addError("added a punch but PunchList has no open punch");
} else {
    results.addSuccess();
}

// Test 3 - adding 2 punches results in only 1 open punch
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
punchList.addPunch('2024-01-10T10:00:10');
if (!punchList.punches.length == 1) {
    results.addError(`punch list can only have 1 open punch (punchList.length=${punchList.punches.length})`);
} else {
    results.addSuccess();
} 

// Test 4 - add and close a punch
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
punchList.closePunch('2024-01-10T10:00:10');
if (!punchList.punches.length == 1) {
    results.addError(`punch list can only have 1 open punch (punchList.length=${punchList.punches.length})`);
} else if (punchList.hasOpenPunch) {
    results.addError(`punch list should not report open punches when all punches have been closed`);
} else {
    results.addSuccess();
}

// Test 5 - successive calls of addPunch/closePunch followed by a final addPunch leaves list with open punches
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
punchList.closePunch('2024-01-10T10:00:10');
punchList.addPunch('2024-01-10T10:00:15');
punchList.closePunch('2024-01-10T10:00:20');
punchList.addPunch('2024-01-10T10:00:30');
if (!punchList.hasOpenPunch) {
    results.addError(`punch list should report open punches when there is a punch without and endTime`);
} else {
    results.addSuccess();
}

// Test 6 - hasPunchAt returns true when given a time within a punch duration
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
punchList.closePunch('2024-01-10T10:00:10');
punchList.addPunch('2024-01-10T10:00:15');
punchList.closePunch('2024-01-10T10:00:20');
punchList.addPunch('2024-01-10T10:00:30');
if (!punchList.hasPunchAt('2024-01-10T10:00:18')) {
    results.addError(`punch list should report open punches when there is a punch without and endTime`);
} else {
    results.addSuccess();
}

// Test 7 - hasPunchAt returns false when given a time outside a punch duration
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
punchList.closePunch('2024-01-10T10:00:10');
punchList.addPunch('2024-01-10T10:00:15');
punchList.closePunch('2024-01-10T10:00:20');
punchList.addPunch('2024-01-10T10:00:30');
if (punchList.hasPunchAt('2024-01-10T10:00:12')) {
    results.addError(`punch list should report open punches when there is a punch without and endTime`);
} else {
    results.addSuccess();
}

// Test 8 - hasPunchAt returns false when given a time greater than open punch start time
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
punchList.closePunch('2024-01-10T10:00:10');
punchList.addPunch('2024-01-10T10:00:15');
punchList.closePunch('2024-01-10T10:00:20');
punchList.addPunch('2024-01-10T10:00:30');
if (punchList.hasPunchAt('2024-01-10T10:00:32')) {
    results.addError(`punch list should report open punches when there is a punch without and endTime`);
} else {
    results.addSuccess();
}

// Test 9 - getPunchAt returns correct punch when given a time within a punch duration
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
punchList.closePunch('2024-01-10T10:00:10');
punchList.addPunch('2024-01-10T10:00:15');
punchList.closePunch('2024-01-10T10:00:20');
punchList.addPunch('2024-01-10T10:00:30');
if (punchList.getPunchAt('2024-01-10T10:00:18') == null || punchList.getPunchAt('2024-01-10T10:00:18').startTime != '2024-01-10T10:00:15') {
    results.addError(`getPunchAt didn't retrieve expected punch or return was null`);
} else {
    results.addSuccess();
}

// Test 10 - getPunchAt returns null when given a time outside a punch duration
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
punchList.closePunch('2024-01-10T10:00:10');
punchList.addPunch('2024-01-10T10:00:15');
punchList.closePunch('2024-01-10T10:00:20');
punchList.addPunch('2024-01-10T10:00:30');
if (punchList.getPunchAt('2024-01-10T10:00:12') !== null) {
    results.addError(`getPunchAt should return null when time is outside any puch duration`);
} else {
    results.addSuccess();
}

// Test 11 - getPunchAt returns null when given a time greater than open punch start time
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
punchList.closePunch('2024-01-10T10:00:10');
punchList.addPunch('2024-01-10T10:00:15');
punchList.closePunch('2024-01-10T10:00:20');
punchList.addPunch('2024-01-10T10:00:30');
if (punchList.getPunchAt('2024-01-10T10:00:32') !== null) {
    results.addError(`getPunchAt not null when time is greater than startTime and the punch is without and endTime`);
} else {
    results.addSuccess();
}

// Test 12 - deletePunchAt deletes punch when given a time within a punch duration
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
punchList.closePunch('2024-01-10T10:00:10');
punchList.addPunch('2024-01-10T10:00:15');
punchList.closePunch('2024-01-10T10:00:20');
punchList.addPunch('2024-01-10T10:00:30');
punchList.closePunch('2024-01-10T10:00:35');
punchList.deletePunchAt('2024-01-10T10:00:17');
if (punchList.getPunchAt('2024-01-10T10:00:16') !== null) {
    results.addError(`deletePunchAt didn't delete punch`);
} else {
    results.addSuccess();
}

// Test 13 - deletePunchAt does nothing when given a time outside a punch duration
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
punchList.closePunch('2024-01-10T10:00:10');
punchList.addPunch('2024-01-10T10:00:15');
punchList.closePunch('2024-01-10T10:00:20');
punchList.deletePunchAt('2024-01-10T10:00:30');
if (punchList.punches.length !=2) {
    results.addError(`deletePunchAt seems to have change PunchList even when the supplied time is outside a punch duration`);
} else {
    results.addSuccess();
}

// Test 14 - canClosePunchAt returns false when inside a completed punch
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
punchList.closePunch('2024-01-10T10:00:10');
if (punchList.canClosePunchAt('2024-01-10T10:00:08') === true) {
    results.addError(`canClosePunchAt returned 'true' when inside a completed punch`);
} else {
    results.addSuccess();
}

// Test 15 - canClosePunchAt returns true when greater than or equal to the start time of an unclosed punch
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:00');
if (punchList.canClosePunchAt('2024-01-10T10:00:08') === false) {
    results.addError(`canClosePunchAt returned 'false' when timecode is greater than or equal to the start time of unclosed punch`);
} else {
    results.addSuccess();
}

// Test 16 - canClosePunchAt returns false when less than the start time of an unclosed punch
var punchList = new PunchList();
punchList.addPunch('2024-01-10T10:00:08');
if (punchList.canClosePunchAt('2024-01-10T10:00:06') === true) {
    results.addError(`canClosePunchAt returned 'true' when timecode is less than the start time of unclosed punch`);
} else {
    results.addSuccess();
}

results.report();
