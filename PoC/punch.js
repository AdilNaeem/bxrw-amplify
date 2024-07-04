export class Punch {
    constructor(startTime) {
        this.startTime = startTime;
        this.endTime = null;
        this.hand = '<empty>';
        this.punchType = '<empty>';
        this.punchQuality = '<empty>';
        this.target = '<empty>';
    }

    setEndTime(endTime) {
        this.endTime = endTime;
    }
}

