// Setup PREDATOR_PREY Critter name space
PREDATOR_PREY.namespace('PREDATOR_PREY.Critter');

PREDATOR_PREY.Critter = function(worldRef, initMaxSpeed, initSize, initColor) {
    "use strict";
    
    // Guard against this object not being invoked with the "new" operator
    if (!(this instanceof PREDATOR_PREY.Critter)) {
        return new PREDATOR_PREY.Critter(worldRef, initMaxSpeed, initSize, initColor);
    }
    
    // Static variable to keep count of the critters
    PREDATOR_PREY.Critter.count = ++PREDATOR_PREY.Critter.count || 0;
    
    var thisCritter,
        img,
        pos,
        vel,
        hdg,
        behaviors = [],                                       // All them critters got behavior problems
        id        = "CRITTER_" + PREDATOR_PREY.Critter.count, // Instance ID based on current static count
        config    = worldRef.getConfig();

    img = new Kinetic.Circle({
        radius: initSize,
        fill: initColor,
        stroke: config.CFG_CRITTER_OUTLINE_COLOR,
        strokeWidth: 1,
        scaleX: 4,
        strokeScaleEnabled: false
    });

    pos = {
        x: Math.random() * config.CFG_HEIGHT,
        y: Math.random() * config.CFG_WIDTH
    };

    vel = {
        x: initMaxSpeed,
        y: 0
    };

    hdg = Math.atan2(vel.y, vel.x);

    img.setX(pos.x);
    img.setY(pos.y);
    img.rotate(hdg);
    
    // Public Interface
    thisCritter = {
        getId: function() {
            return id;
        },
        isSameCritter: function(critter) {
            return (critter.getId() === id)
        },
        getImage: function() {
            return img;
        },
        getPosition: function() {
            return pos;
        },
        setPosition: function(position) {
            
            if (isNaN(position.x) || isNaN(position.y)) {
                throw new Error("Invalid position: " + position.x + " " + position.y);
            } else {
                pos = position;
            }
        },
        getVelocity: function() {
            return vel;
        },
        setVelocity: function(velocity) {
            
            if (isNaN(velocity.x) || isNaN(velocity.y)) {
                throw new Error("Invalid velocity: " + velocity.x + " " + velocity.y);
            } else {
                vel = velocity;
            }
        },
        getDistance: function(critter) {
            var critterPos = critter.getPosition(),
                distX      = pos.x - critterPos.x,
                distY      = pos.y - critterPos.y;

            return Math.sqrt(distX * distX + distY * distY);
        },
        getAveragePosition: function(critters, detectionRange) {
            var critterPos,
                avgX = 0,
                avgY = 0;

            critters.forEach(function (critter) {
                critterPos = critter.getPosition();

                if (thisCritter.getDistance(critter) <= detectionRange) {
                    avgX += (pos.x - critterPos.x);
                    avgY += (pos.y - critterPos.y);
                }
            });

            avgX /= critters.length;
            avgY /= critters.length;

            return {x: avgX, y: avgY};
        },
        getAverageDistance: function(avgPosition) {
            return Math.sqrt((avgPosition.x * avgPosition.x) + (avgPosition.y * avgPosition.y)) * -1.0;
        },
        addBehavior: function(behavior) {
            behaviors.push(behavior);
        },
        avoid: function(critters, minDist, avoidanceFactor) {
            var distanceX = 0,
                distanceY = 0,
                numClose  = 0,
                xDiff,
                yDiff,
                critterPos,
                distance;

            critters.forEach(function(critter) {
                critterPos = critter.getPosition();

                // Don't include itself
                if (critter.getId() !== id) {
                    distance = thisCritter.getDistance(critter);

                    if (distance < minDist) {
                        numClose++;

                        xDiff = (pos.x - critterPos.x);
                        yDiff = (pos.y - critterPos.y);

                        if (xDiff < 0) {
                            distanceX += Math.sqrt(minDist) - xDiff;
                        } else {
                            distanceX += -Math.sqrt(minDist) - xDiff;
                        }

                        if (yDiff < 0) {
                            distanceY += Math.sqrt(minDist) - yDiff;
                        } else {
                            distanceY += -Math.sqrt(minDist) - yDiff;
                        }
                    }
                }
            });

            if (numClose > 0) {
                vel.x -= distanceX / avoidanceFactor;
                vel.y -= distanceY / avoidanceFactor;
            }
        },
        attractTo: function(critters, attractionFactor, attractionRange) {
            var avgPos,
                avgDist;

            if (critters.length > 0) {
                avgPos  = thisCritter.getAveragePosition(critters, attractionRange);
                avgDist = thisCritter.getAverageDistance(avgPos);

                if (avgDist !== 0) {
                    vel.x = Math.min(vel.x + (avgPos.x / avgDist) * attractionFactor, initMaxSpeed);
                    vel.y = Math.min(vel.y + (avgPos.y / avgDist) * attractionFactor, initMaxSpeed);
                }
            }
        },
        move: function() {
            var onScreenTendancy = config.CFG_ON_SCREEN_TENDENCY,
                decelRate        = config.CFG_CRITTER_DECELERATION_FACTOR,
                newHdg;

            // Loop through each behavior function to control how the critter moves
            behaviors.forEach(function(behavior) {
                behavior();
            });
                
            // track position
            pos.x += vel.x;
            pos.y += vel.y;
            
            // limit speed	
            var speed = Math.sqrt((vel.x * vel.x) + (vel.y * vel.y));
            
            if (speed > initMaxSpeed) {
                vel.x = vel.x * decelRate;
                vel.y = vel.y * decelRate;
            }
            
            // check x bounds and change direction
            if (pos.x < (initSize * 5)) {
                vel.x += initMaxSpeed * onScreenTendancy;
                pos.x += vel.x;
            }
            
            if (pos.x > (worldRef.getWidth() - (initSize * 5))) {
                vel.x -= initMaxSpeed * onScreenTendancy;
                pos.x += vel.x;
            }
            
            // check y bounds and change direction
            if (pos.y < (initSize * 5)) {
                vel.y += initMaxSpeed * onScreenTendancy;
                pos.y += vel.y;
            }
            
            if (pos.y > (worldRef.getHeight() - (initSize * 5))) {
                vel.y -= initMaxSpeed * onScreenTendancy;
                pos.y += vel.y;
            }
            
            // move critter
            img.setX(pos.x);
            img.setY(pos.y);
            
            // change critter orientation based on velocity vector
            newHdg = Math.atan2(vel.y, vel.x);
            
            img.rotate(newHdg - hdg);
            
            hdg = newHdg;
        }
    };
    
    return thisCritter;
};