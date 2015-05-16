// Setup PREDATOR_PREY Prey name space
PREDATOR_PREY.namespace('PREDATOR_PREY.Prey');

/**
 * Prey is a specialized critter that avoids predators and schools with other prey.
 * 
 */
PREDATOR_PREY.Prey = function(world) {
    "use strict";
    
    // Guard against this object not being invoked with the "new" operator
    if (!(this instanceof PREDATOR_PREY.Prey)) {
        return new PREDATOR_PREY.Prey(world);
    }
    
    var thisPrey,
        initSize     = 1,
        config       = world.getConfig(),
        initMaxSpeed = config.CFG_PREY_MAX_SPEED;

    // Prey extends critter
    thisPrey = Object.create(new PREDATOR_PREY.Critter(world, initMaxSpeed, initSize, config.CFG_PREY_COLOR));
    
    // Add behavior models in order of most important last
    thisPrey.addBehavior(avoid);
    thisPrey.addBehavior(align);
    thisPrey.addBehavior(group);
    thisPrey.addBehavior(evade);
        
    // give the other prey personal space
    function avoid() {
        var prey            = world.getPrey(),
            avoidanceFactor = config.CFG_PREY_AVOID_FACTOR,
            personalSpace   = config.CFG_PREY_PERSONAL_SPACE;

        if (prey.length > 0) {
            thisPrey.avoid(prey, personalSpace, avoidanceFactor);
        }
    }
    
    // prey group together method
    function group() {
        var velocity           = thisPrey.getVelocity(),
            prey               = world.getPrey(),
            codependencyFactor = config.CFG_PREY_CODEPENDENCY_FACTOR,
            detectionRange     = config.CFG_PREY_GROUP_DISTANCE,
            avgPos,
            avgDist;

        if (prey.length > 0) {
            avgPos  = thisPrey.getAveragePosition(prey, detectionRange);
            avgDist = thisPrey.getAverageDistance(avgPos);

            if (avgDist !== 0) {
                velocity.x = Math.min(velocity.x + (avgPos.x / avgDist) * codependencyFactor, initMaxSpeed);
                velocity.y = Math.min(velocity.y + (avgPos.y / avgDist) * codependencyFactor, initMaxSpeed);

                thisPrey.setVelocity(velocity);
            }
        }
    }
    
    // prey align direction method
    function align() {
        // calculate the average velocity of the other prey
        var avgX     = 0,
            avgY     = 0,
            velocity = thisPrey.getVelocity(),
            prey     = world.getPrey(),
            critterVel,
            distance;
            
        if (prey.length > 0) {

            prey.forEach(function(critter) {

                if (!thisPrey.isSameCritter(critter)) {

                    if (thisPrey.getDistance(critter) <= config.CFG_PREY_ALIGN_DISTANCE) {
                        critterVel = critter.getVelocity();
                        avgX      += critterVel.x;
                        avgY      += critterVel.y;
                    }
                }
            });

            avgX    /= prey.length;
            avgY    /= prey.length;
            distance = Math.sqrt((avgX * avgX) + (avgY * avgY));

            if (distance !== 0) {
                velocity.x = Math.min(velocity.x + (avgX / distance) * 0.05, initMaxSpeed); // XXX need to look at this what is the 0.05 value in the model
                velocity.y = Math.min(velocity.y + (avgY / distance) * 0.05, initMaxSpeed); // XXX need to look at this what is the 0.05 value in the model

                thisPrey.setVelocity(velocity);
            }
        }
    }
    
    // prey evade predator method
    function evade() {
        var predators     = world.getPredators(),
            predatorRange = config.CFG_PREY_EVADE_DISTANCE,
            fearFactor    = config.CFG_PREY_FEAR_FACTOR;

        if (predators.length > 0) {
            thisPrey.avoid(predators, predatorRange, fearFactor);
        }
    }
    
    return thisPrey;
};