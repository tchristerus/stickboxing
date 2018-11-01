/** Used to simulate client side animations (timing) */
class Animation {

    /**
     * Constructor
     * @param {number} frames
     * @param {number} fps
     */
    constructor(frames, fps) {
        this.frames = frames;
        this.fps = fps;
    }

    /**
     * Total frames in the animation
     * @return {number}
     */
    getFrames() {
        return this.frames;
    }

    /**
     * Total time the animation will take
     * @return {number} Milliseconds
     */
    getTotalTime() {
        return (1000/this.fps) * this.frames;
    }

    /**
     * Total time until a specific frame is reached
     * @param {number} frame
     * @return {number} Milliseconds
     */
    getSpecificFrameTime(frame) {
        return (1000/this.fps) * frame;
    }

}

module.exports = Animation;
