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

    // prey evade predator method basically the same as avoid but given stronger factors
    function evade() {
        var predators     = world.getPredators(),
            predatorRange = config.CFG_PREY_EVADE_DISTANCE,
            fearFactor    = config.CFG_PREY_FEAR_FACTOR;

        if (predators.length > 0) {
            thisPrey.avoid(predators, predatorRange, fearFactor);
        }
    }
    
    // prey group together method (using the basic critter attraction trait)
    function group() {
        var prey               = world.getPrey(),
            codependencyFactor = config.CFG_PREY_CODEPENDENCY_FACTOR,
            detectionRange     = config.CFG_PREY_GROUP_DISTANCE;

        thisPrey.attractTo(prey, codependencyFactor, detectionRange);
    }
    
    // prey align direction method (only prey have this trait)
    function align() {
        // calculate the average velocity of the other prey
        var avgXVel  = 0,
            avgYVel  = 0,
            velocity = thisPrey.getVelocity(),
            prey     = world.getPrey(),
            critterVel,
            distance;
            
        if (prey.length > 0) {

            prey.forEach(function(critter) {

                if (!thisPrey.isSameCritter(critter)) {

                    if (thisPrey.getDistance(critter) <= config.CFG_PREY_ALIGN_DISTANCE) {
                        critterVel = critter.getVelocity();
                        avgXVel   += critterVel.x;
                        avgYVel   += critterVel.y;
                    }
                }
            });

            avgXVel /= prey.length;
            avgYVel /= prey.length;
            distance = Math.sqrt((avgXVel * avgXVel) + (avgYVel * avgYVel));

            if (distance !== 0) {
                velocity.x = Math.min(velocity.x + (avgXVel / distance) * 0.05, initMaxSpeed);
                velocity.y = Math.min(velocity.y + (avgYVel / distance) * 0.05, initMaxSpeed);

                thisPrey.setVelocity(velocity);
            }
        }
    }
    
    return thisPrey;
};