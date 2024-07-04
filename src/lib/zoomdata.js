export class ZoomData {
    constructor() {
        this.zoomlist = [];
    }

    addRect(rect, frame) {
        console.log(`adding rectangle ${JSON.stringify(rect)}`);
        this.zoomlist.push(new ZoomRecord(rect, frame));
        console.log(`after adding zoomlist: ${JSON.stringify(this.zoomlist)}`);
    }
}

class ZoomRecord {
    constructor(rect, initialFrame) {
        this.rect = rect;
        this.frame = initialFrame;
    }
}