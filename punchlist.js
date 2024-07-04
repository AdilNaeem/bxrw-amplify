import { Punch } from './punch.js';

export class PunchList {
    constructor() {
        this.punches = [];
    }

    addPunch(startTime) {
        if (this.hasOpenPunch) {
            return; // Return early if there's an open punch
        }
        const punch = new Punch(startTime);
        this.punches.push(punch);
    }

    closePunch(endTime) {
        this.punches.forEach(punch => {
            if (punch.endTime === null) {
                punch.endTime = endTime;
            }
        });
    }

    canClosePunchAt(time) {
        // should return true only when there is an unclosed punch and the time is >= start time
        if (this.hasOpenPunch) {
            const index = this.punches.findIndex(punch => {
                return punch.endTime === null;
            });
            const openPunch = this.punches[index];
            if (time < openPunch.startTime) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    
    hasPunchAt(time) {
        return this.punches.some(punch => {
            return punch.endTime !== null && time >= punch.startTime && time <= punch.endTime;
        });
    }

    getPunchAt(time) {
        const foundPunch = this.punches.find(punch => {
            return punch.endTime !== null && time >= punch.startTime && time <= punch.endTime;
        });
        return foundPunch || null;
    }

    deletePunchAt(time) {
        const index = this.punches.findIndex(punch => {
            return punch.endTime !== null && time >= punch.startTime && time <= punch.endTime;
        });
        if (index !== -1) {
            this.punches.splice(index, 1);
        }
    }

    get hasOpenPunch() {
        return this.punches.some(punch => punch.endTime === null);
    }
}


