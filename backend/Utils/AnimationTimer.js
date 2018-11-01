/** Util to simulate animations */
class AnimationTimer {

    /**
     * This callback will get called whenever the animation is finished
     *
     * @callback animationCallback
     */

    /**
     * Will calculate the total animation time and give a callback when done
     * @param {Animation} animation
     * @param {animationCallback} callback
     */
    static animateWhole(animation, callback) {
        setTimeout(callback, animation.getTotalTime());
    }

    /**
     * This callback will get called whenever the animation reaches a specific frame
     *
     * @callback animationSpecificFrameCallback
     */

    /**
     * Will calculate the total animation time and give a callback when done
     * @param {Animation} animation
     * @param {number} frame
     * @param {animationSpecificFrameCallback} callback
     */
    static animateUntilFrame(animation, frame, callback) {
        setTimeout(callback, animation.getSpecificFrameTime(frame));
    }

}

module.exports = AnimationTimer;
