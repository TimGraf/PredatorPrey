// Setup PREDATOR_PREY Prey name space
PREDATOR_PREY.namespace('PREDATOR_PREY.Prey');

/**
 * Prey is a specialized critter that avoids predators and schools with other prey.
 * 
 */
PREDATOR_PREY.Prey = function(worldRef) {
    "use strict";
    
    // Guard against this object not being invoked with the "new" operator
    if (!(this instanceof PREDATOR_PREY.Prey)) {
        return new PREDATOR_PREY.Prey(worldRef);
    }
    
    var publicInterface,
        config,
        initPos,
        initVel,
        initSize = 1,
        initMaxSpeed,
        base,
        behaviors;
        
    // initi local variables
    config = worldRef.getConfig();
    initPos = {
        x: Math.random() * config.CFG_HEIGHT,
        y: Math.random() * config.CFG_WIDTH
    };
    initMaxSpeed = config.CFG_PREY_MAX_SPEED; // used more than once so set local reference
    initVel = {
        x: initMaxSpeed,
        y: 0
    };
    base = new PREDATOR_PREY.Critter(worldRef, initPos, initVel, initMaxSpeed, initSize, config.CFG_PREY_COLOR);
    behaviors = [];
    
    // Add behavior models in order of most important last
    behaviors.push(group);
    behaviors.push(align);
    behaviors.push(avoid);
    behaviors.push(evade);
    behaviors.push(base.move);
        
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
            prey = worldRef.getPrey(),
            avoidanceFactor = config.CFG_PREY_AVOID_FACTOR, // used more than once so set local reference
            personalSpace = config.CFG_PREY_PERSONALSPACE; // used more than once so set local reference
            
        if(prey.length < 1) {
            return;
        }

        for (i = 0; i < prey.length; i++) {
            critter = prey[i];
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
    
    // prey group together method
    function group() {
        
        //
        var avgX = 0,
            avgY = 0,
            i,
            critter,
            critterPos,
            critterVel,
            distance,
            position = base.getPosition(),
            velocity = base.getVelocity(),
            prey = worldRef.getPrey(),
            codependencyFactor = config.CFG_PREY_CODEPENDENCY_FACTOR; // used more than once so set local reference
            

        for (i = 0; i < prey.length; i++) {
            critter = prey[i];
            critterPos = critter.getPosition();
            critterVel = critter.getVelocity();
            
            if (critterPos.x == position.x && critterPos.y == position.y) {
                continue;
            }

            if(base.getDistance(critter) > config.CFG_PREY_GROUP_DISTANCE) {
                continue;
            }
            
            avgX += (position.x - critterPos.x);
            avgY += (position.y - critterPos.y);
        }
                
        avgX /= prey.length;
        avgY /= prey.length;
        
        distance = Math.sqrt((avgX * avgX) + (avgY * avgY)) * -1.0;
        
        if (distance == 0) {
            return;
        }
        
        velocity.x = Math.min(velocity.x + (avgX / distance) * codependencyFactor, initMaxSpeed)
        velocity.y = Math.min(velocity.y + (avgY / distance) * codependencyFactor, initMaxSpeed)
        
        base.setVelocity(velocity);
    }
    
    // prey align direction method
    function align() {

        // calculate the average velocity of the other prey
        var avgX = 0,
            avgY = 0,
            i,
            critter,
            critterPos,
            critterVel,
            distance,
            position = base.getPosition(),
            velocity = base.getVelocity(),
            prey = worldRef.getPrey();
            
        if (prey.length < 1) {
            return;
        }

        for (i = 0; i < prey.length; i++) {
            critter = prey[i];
            critterPos = critter.getPosition();
            critterVel = critter.getVelocity();
            
            if (critterPos.x == position.x && critterPos.y == position.y) {
                continue;
            }
            
            if (base.getDistance(critter) > config.CFG_PREY_ALIGN_DISTANCE) {
                continue;
            }
            
            avgX += critterVel.x;
            avgY += critterVel.y;
        }

        avgX /= prey.length;
        avgY /= prey.length;

        distance = Math.sqrt((avgX * avgX) + (avgY * avgY)) * 1.0;
        
        if (distance == 0) {
            return;
        }

        velocity.x = Math.min(velocity.x + (avgX / distance) * 0.05, initMaxSpeed); // XXX need to look at this what is the 0.05 value in the model
        velocity.y = Math.min(velocity.y + (avgY / distance) * 0.05, initMaxSpeed); // XXX need to look at this what is the 0.05 value in the model
        
        base.setVelocity(velocity);
    }
    
    // prey evade predator method
    function evade() {
        var i,
            prey = worldRef.getPrey(),
            predators = worldRef.getPredators(),
            predatorRange = config.CFG_PREY_EVADE_DISTANCE, // used more than once so set local reference
            fearFactor = config.CFG_PREY_FEAR_FACTOR, // used more than once so set local reference
            xdiff,
            predator,
            ydiff,
            distanceX = 0,
            distanceY = 0,
            distance,
            predatorPos,
            position = base.getPosition(),
            velocity = base.getVelocity();
            
        for (i = 0; i < predators.length; i++) {
            predator = predators[i];
            distance = base.getDistance(predator);
            predatorPos = predator.getPosition();

            if (distance < predatorRange) {
                xdiff = (position.x - predatorPos.x);
                ydiff = (position.y - predatorPos.y);
    
                if (xdiff >= 0) {
                    xdiff = Math.sqrt(predatorRange) - xdiff;
                } else if(xdiff < 0) {
                    xdiff = -Math.sqrt(predatorRange) - xdiff;
                }
    
                if (ydiff >= 0) {
                    ydiff = Math.sqrt(predatorRange) - ydiff;
                } else if (ydiff < 0) {
                    ydiff = -Math.sqrt(predatorRange) - ydiff;
                }
    
                distanceX += xdiff;
                distanceY += ydiff;
            } else {
                continue;
            }
        }
        
        // more compelled to evade predator than avoid one another
        velocity.x -= distanceX / fearFactor;
        velocity.y -= distanceY / fearFactor;
        
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
            
            // Loop through each bahivor model to move the prey
            for (var i = 0, len = behaviors.length; i < len; i++) {
                behaviors[i]();
            }
        }
    }
    
    return publicInterface;
}