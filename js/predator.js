// Setup PREDATOR_PREY Predator name space
PREDATOR_PREY.namespace('PREDATOR_PREY.Predator');

/**
 * Predator is a specialized critter that chases prey.
 * 
 */
PREDATOR_PREY.Predator = function(worldRef) {
    "use strict";
    
    // Guard against this object not being invoked with the "new" operator
    if (!(this instanceof PREDATOR_PREY.Predator)) {
        return new PREDATOR_PREY.Predator(worldRef);
    }

    var thisPredator,
        initPos,
        initVel,
        initSize     = 3,
        config       = worldRef.getConfig(),
        initMaxSpeed = config.CFG_PREDATOR_MAX_SPEED;

    initPos = {
        x: Math.random() * config.CFG_HEIGHT,
        y: Math.random() * config.CFG_WIDTH
    };

    initVel = {
        x: initMaxSpeed,
        y: 0
    };
    // Predator extends critter
    thisPredator = Object.create(new PREDATOR_PREY.Critter(worldRef, initPos, initVel, initMaxSpeed, initSize, config.CFG_PREDATOR_COLOR));
    
    // Add behavior models in order of most important last
    thisPredator.addBehavior(avoid);
    thisPredator.addBehavior(chase);
    
    // the chase is on
    function chase() {
        // calculate the average distance to the detectable prey
        var prey              = worldRef.getPrey(),
            velocity          = thisPredator.getVelocity(),
            detectionRange    = config.CFG_PREDATOR_DETECTION_RAGE,
            maneuveringFactor = config.CFG_PREDATOR_MANEUVER_FACTOR,
            avgPos,
            avgDist;

        if (prey.length > 0) {
            avgPos  = thisPredator.getAveragePosition(prey, detectionRange);
            avgDist = thisPredator.getAverageDistance(avgPos);

            if (Math.abs(avgDist) > (detectionRange * 0.2)) {
                velocity.x += (avgPos.x / avgDist) * maneuveringFactor;
                velocity.y += (avgPos.y / avgDist) * maneuveringFactor;

                thisPredator.setVelocity(velocity);
            }
        }
    }
    
    // give the other predator personal space
    function avoid() {
        var predators       = worldRef.getPredators(),
            avoidanceFactor = config.CFG_PREDATOR_AVOID_FACTOR,
            personalSpace   = config.CFG_PREDATOR_PERSONAL_SPACE;
            
        if (predators.length > 0) {
            thisPredator.avoid(predators, personalSpace, avoidanceFactor);
        }
    }
    
    return thisPredator;
};