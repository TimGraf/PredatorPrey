// Global PREDATOR_PREY namespace for all projects and applications
var PREDATOR_PREY = PREDATOR_PREY || {};
/*
 * Namespace Pattern
 *
 * Description: namespaces help reduce the number of globals required
 * and avoid naming collisions or excessive name prefixing.
 *
 * This was adapted from Stoyan Stefanov's Book,
 * "JavaScript Patterns" (2010) O'Reilly Media Inc.
 * 
 */
if (typeof PREDATOR_PREY.namespace === "undefined") {
    //
    PREDATOR_PREY.namespace = function(ns_string) {
        "use strict";
        
        var parts  = ns_string.split('.'),
            parent = PREDATOR_PREY;
            
        // strip redundant leading global
        if (parts[0] === "PREDATOR_PREY") {
            parts = parts.slice(1);
        }
    
        parts.forEach(function(part) {
            // create a property if it doesn't exist
            if (typeof parent[part] === "undefined") {
                parent[part] = {};
            }
            parent = parent[part];
        });

        return parent;
    };
}

// List of dependant JavaScript files for this module
var jsFiles = [
    "./js/kinetic-v4.7.4.min.js",
    "./js/world.js",
    "./js/critter.js",
    "./js/prey.js",
    "./js/predator.js"
];

// Load JavaScript files
for (var i = 0; i < jsFiles.length; i++) {
    document.write("<script type='text/javascript' src='" + jsFiles[i] + "'></script>");
}

// Wait until all of the css and scipts have been loaded
window.onload = function() {
    var config = {
            CSS_CONTAINER: "container",
            CFG_WIDTH: 600,
            CFG_HEIGHT: 400,
            CFG_NUM_PREY: 180,
            CFG_NUM_PREDATOR: 2,
            CFG_ON_SCREEN_TENDENCY: 0.04, // higher values more likely to stay on screen
            CFG_CRITTER_DECELERATION_FACTOR: 0.5, // lower value quicker deceleration
            CFG_CRITTER_OUTLINE_COLOR: "#000000", // used for both predator and prey
            CFG_PREY_COLOR: "#AAAAAA", // prey fill color
            CFG_PREY_ALIGN_DISTANCE: 100, // range at which prey begin to align direction
            CFG_PREY_GROUP_DISTANCE: 200, // range at which prey begin to group
            CFG_PREY_EVADE_DISTANCE: 100, // range at which prey evade a predator
            CFG_PREY_AVOID_FACTOR: 75, // lower values quicker to avoid other prey
            CFG_PREY_FEAR_FACTOR: 25, // lower values quicker to evade a predator
            CFG_PREY_CODEPENDENCY_FACTOR: 0.015, // higher values quicker to group
            CFG_PREY_PERSONAL_SPACE: 7, // lower values mean tighter prey grouping
            CFG_PREY_MAX_SPEED: 1,
            CFG_PREDATOR_COLOR: "#333333", // predator fill color
            CFG_PREDATOR_DETECTION_RAGE: 300, // range at which predator detects prey
            CFG_PREDATOR_MAX_SPEED: 0.25,
            CFG_PREDATOR_MANEUVER_FACTOR: 0.2, // lower means slower to react
            CFG_PREDATOR_AVOID_FACTOR: 800, // lower values quicker to avoid other predators
            CFG_PREDATOR_PERSONAL_SPACE: 80 // predators need lots of personal space
        },
        world;
        
        world = new PREDATOR_PREY.World(config);
        
        world.init();
};
