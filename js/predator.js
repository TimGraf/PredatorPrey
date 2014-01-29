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
    
    var publicInterface,
        initMaxSpeed,
        initSize = 3,
        initPos,
        initVel,
        config,
        base,
        behaviors;
    
    // initi local variables
    config = worldRef.getConfig();
    initPos = {
        x: Math.random() * config.CFG_HEIGHT,
        y: Math.random() * config.CFG_WIDTH
    };
    initMaxSpeed = config.CFG_PREDATOR_MAX_SPEED; // used more than once so set local reference
    initVel = {
        x: initMaxSpeed,
        y: 0
    };
    base = new PREDATOR_PREY.Critter(worldRef, initPos, initVel, initMaxSpeed, initSize, config.CFG_PREDATOR_COLOR);
    behaviors = [];
    
    // Add behavior models in order of most important last
    behaviors.push(avoid);
    behaviors.push(chase);
    behaviors.push(base.move);
    
    // the chase is on
    function chase() {

        // calculate the average distance to the detectable prey
        var avgX = 0,
            avgY = 0,
            avgDist,
            i,
            critter,
            critterPos,
            prey  = worldRef.getPrey(),
            position = base.getPosition(),
            velocity = base.getVelocity(),
            detectionRange = config.CFG_PREDATOR_DETECTION_RAGE, // used more than once so set local reference
            maneuveringFactor = config.CFG_PREDATOR_MANEUVER_FACTOR; // used more than once so set local reference
            
        if (prey.length < 1) {
            return;
        }

        for (i = 0; i < prey.length; i++) {
            critter = prey[i];
            critterPos = critter.getPosition();
            
            if (base.getDistance(critter) > detectionRange) {
                continue;
            }
            
            avgX += (position.x - critterPos.x);
            avgY += (position.y - critterPos.y);
        }

        avgX /= prey.length;
        avgY /= prey.length;

        avgDist = Math.sqrt((avgX * avgX) + (avgY * avgY)) * -1.0;

        if (Math.abs(avgDist) < (detectionRange * 0.2)) {
            return;
        }
        
        velocity.x += (avgX / avgDist) * maneuveringFactor;
        velocity.y += (avgY / avgDist) * maneuveringFactor;
        
        base.setVelocity(velocity);
    }
    
        // give the other prey personal space
    function avoid() {
        
        //
        var distanceX = 0,
            distanceY = 0,
            numClose = 0,
            xdiff,
            ydiff,
            i,
            critter,
            critterPos,
            distance,
            position = base.getPosition(),
            velocity = base.getVelocity(),
            predators = worldRef.getPredators(),
            avoidanceFactor = config.CFG_PREDATOR_AVOID_FACTOR, // used more than once so set local reference
            personalSpace = config.CFG_PREDATOR_PERSONALSPACE; // used more than once so set local reference
            
        if(predators.length < 1) {
            return;
        }

        for (i = 0; i < predators.length; i++) {
            critter = predators[i];
            critterPos = critter.getPosition();
                
            // Don't include itself
            if (critter.getId() == base.getId()) {
                continue;
            }
                
            distance = base.getDistance(critter);

            if (distance < personalSpace) {
                numClose++;
                
                xdiff = (position.x - critterPos.x);
                ydiff = (position.y - critterPos.y);
    
                if (xdiff >= 0) {
                    xdiff = Math.sqrt(personalSpace) - xdiff;
                } else if (xdiff < 0) {
                    xdiff = -Math.sqrt(personalSpace) - xdiff;
                }

                if (ydiff >= 0) {
                    ydiff = Math.sqrt(personalSpace) - ydiff;
                } else if (ydiff < 0) {
                    ydiff = -Math.sqrt(personalSpace) - ydiff;
                }

                distanceX += xdiff;
                distanceY += ydiff;
            }
        }
        
        if (numClose == 0) {
            return;
        }
        
        velocity.x -= distanceX / avoidanceFactor;
        velocity.y -= distanceY / avoidanceFactor;
        
        base.setVelocity(velocity);
    }

    // Public Interface - any methods defined here should be well documented
    publicInterface = {
        getId: function() {
            return base.getId();
        },
        getImage: function() {
            return base.getImage();
        },
        getPosition: function() {
            return base.getPosition();
        },
        getDistance: function(critter) {
            return base.getDistance();
        },
        getVelocity: function() {
            return base.getVelocity();  
        },
        move: function() {
            
            // Loop through each bahivor model to move the predator
            for (var i = 0, len = behaviors.length; i < len; i++) {
                behaviors[i]();
            }
        }
    }
    
    return publicInterface;
}