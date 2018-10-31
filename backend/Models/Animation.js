class Animation {

    constructor(name, frames, fps){
        this.name = name;
        this.frames = frames;
        this.fps = fps;
    }

    getName(){
        return this.name;
    }

    getFrames(){
        return this.frames;
    }

    getFPS(){
        return this.fps();
    }

    getTotalTime(){
        return (1000/this.fps) * this.frames;
    }

    getSpecificFrameTime(frame){
        return (1000/this.fps) * frame;
    }
}

module.exports = Animation;
