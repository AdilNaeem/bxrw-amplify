export class Punch {
    constructor(startTime) {
        this.startTime = startTime;
        this.endTime = null;
        this.hand = '<empty>';
        this.punchType = '<empty>';
        this.punchQuality = '<empty>';
        this.target = '<empty>';
        this.knockdown = false;
        this.footOffGround = false;
    }

    setEndTime(endTime) {
        this.endTime = endTime;
    }

    finished() {
        return this.hand !== '<empty>' &&
               this.punchType !== '<empty>' &&
               this.punchQuality !== '<empty>' &&
               this.target !== '<empty>';
    }
}

