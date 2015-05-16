// Setup PREDATOR_PREY World name space
PREDATOR_PREY.namespace('PREDATOR_PREY.World');

PREDATOR_PREY.World = function(config) {
    "use strict";
    
    // Guard against this object not being invoked with the "new" operator
    if (!(this instanceof PREDATOR_PREY.World)) {
        return new PREDATOR_PREY.World(config);
    }
    
    var publicInterface,
        predators = [],
        prey      = [];

    // Public Interface - any methods defined here should be well documented
    publicInterface = {
        getWidth: function() {
            return config.CFG_WIDTH;
        },
        getHeight: function() {
            return config.CFG_HEIGHT;
        },
        getPrey: function() {
            return prey;
        },
        getPredators: function() {
            return predators;
        },
        getConfig: function() {
            return config;  
        },
        init: function() {
            var i,
                critter,
                layer = new Kinetic.Layer(),
                stage = new Kinetic.Stage({
                    container: config.CSS_CONTAINER,
                    width: config.CFG_WIDTH,
                    height: config.CFG_HEIGHT
                }),
                anim = new Kinetic.Animation(function(frame) {

                    predators.forEach(function(critter) {
                        critter.move();
                    });

                    prey.forEach(function(critter) {
                        critter.move();
                    });
                }, layer);

            // Fill the world with predator critters
            for (i = 0; i < config.CFG_NUM_PREDATOR; i++) {
                critter = new PREDATOR_PREY.Predator(publicInterface);
                
                predators.push(critter);
                layer.add(critter.getImage());
            }
            // Fill the world with prey critters
            for (i = 0; i < config.CFG_NUM_PREY; i++) {
                critter = new PREDATOR_PREY.Prey(publicInterface);
                
                prey.push(critter);
                layer.add(critter.getImage());
            }
            
            stage.add(layer);
            anim.start();
        }
    };
    
    return publicInterface;
};