import { PunchList } from './PunchList.js';

test("trivial test", () => {

});

test("new PunchList has no unfinished punches", () => {
    var punchlist = new PunchList();
    expect(punchlist.hasOpenPunch).toBe(false);
});
