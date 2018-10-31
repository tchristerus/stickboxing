class AnimationTimer {

    /***
     * Will calculate the total animation time and give a callback when done
     * @param animation
     * @param callback
     */
    static animateWhole(animation, callback){
        setTimeout(callback, animation.getTotalTime());
    }


    static animateUntilFrame(animation, frame, callback){
        setTimeout(callback, animation.getSpecificFrameTime(frame));
    }
}

module.exports = AnimationTimer;
