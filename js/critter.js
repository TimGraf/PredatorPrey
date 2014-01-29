// Setup PREDATOR_PREY Critter name space
PREDATOR_PREY.namespace('PREDATOR_PREY.Critter');

PREDATOR_PREY.Critter = function(worldRef, initPos, initVel, initMaxSpeed, initSize, initColor) {
    "use strict";
    
    // Guard against this object not being invoked with the "new" operator
    if (!(this instanceof PREDATOR_PREY.Critter)) {
        return new PREDATOR_PREY.Critter(worldRef, initPos, initVel, initMaxSpeed, initSize, initColor);
    }
    
    // Static variable to keep count of the criiters
    PREDATOR_PREY.Critter.count = ++PREDATOR_PREY.Critter.count || 0;
    
    var id,
        publicInterface,
        config,
        img,
        pos = initPos,
        vel = initVel,
        hdg = Math.atan2(vel.y, vel.x);
    
    // Instance ID based on current staic count
    id = "CRITTER_" + PREDATOR_PREY.Critter.count;
    config = worldRef.getConfig();
    img = new Kinetic.Circle({
        radius: initSize,
        fill: initColor, // use parameter since predator and prey use this object
        stroke: config.CFG_CRITTER_OUTLINE_COLOR,
        strokeWidth: 1,
        scaleX: 4,
        strokeScaleEnabled: false
    });
        
    img.setX(initPos.x);
    img.setY(initPos.y);
    img.rotate(hdg);
    
    // Public Interface - any methods defined here should be well documented
    publicInterface = {
        getId: function() {
            return id;
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
                distX = pos.x - critterPos.x,
                distY = pos.y - critterPos.y;

            return Math.sqrt(distX * distX + distY * distY);
        },
        move: function() {
            var newHdg,
                onScreenTendancy = config.CFG_ON_SCREEN_TENDANCY,
                decelRate = config.CFG_CRITTER_DECELERATION_FACTOR;
                
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
    }
    
    return publicInterface;
}