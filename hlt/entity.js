const { Direction, Position } = require('./positionals');

const commands = require('./commands');
const constants = require('./constants');
const logging = require('./logging');


/** Base entity class for Ships, Dropoffs, and Shipyards. */
class Entity {
    constructor(owner, id, position) {
        this.owner = owner;
        this.id = id;
        this.position = position;
    }

    toString() {
        return `${this.constructor.name}(id=${this.id}, ${this.position})`;
    }

}

/** Represents a dropoff. */
class Dropoff extends Entity {
    /**
     * Create a Dropoff for a specific player from the engine input.
     * @private
     * @param playerId the player that owns this dropoff
     * @param {Function} getLine function to read a line of input
     * @returns {Dropoff}
     */
    static async _generate(playerId, getLine) {
        const [ id, xPos, yPos ] = (await getLine())
              .split(/\s+/)
              .map(x => parseInt(x, 10));
        return [ id, new Dropoff(playerId, id, new Position(xPos, yPos)) ];
    }
}

/** Represents a shipyard. */
class Shipyard extends Entity {
    /** Return a move to spawn a new ship at your shipyard. */
    spawn() {
        return commands.GENERATE;
    }
}

/** Represents a ship. */
 class Ship extends Entity {
    constructor(owner, id, position, haliteAmount) {
        super(owner, id, position);
        this.haliteAmount = haliteAmount;
    }

    /** Is this ship at max halite capacity? */
    get isFull() {
        return this.haliteAmount >= constants.MAX_HALITE;
    }

    /** Return a move to turn this ship into a dropoff. */
    makeDropoff() {
        return `${commands.CONSTRUCT} ${this.id}`;
    }

    /**
     * Return a command to move this ship in a direction without
     * checking for collisions.
     * @param {String|Direction} direction the direction to move in
     * @returns {String} the command
     */
    move(direction) {
        if (direction.toWireFormat) {
            direction = direction.toWireFormat();
        }
        return `${commands.MOVE} ${this.id} ${direction}`;
    }

    /**
     * Return a command to not move this ship.
     *
     * Not strictly needed, since ships do nothing by default.
     */
    stayStill() {
        return `${commands.MOVE} ${this.id} ${commands.STAY_STILL}`;
    }

    /**
     * Create a Ship instance for a player using the engine input.
     * @param playerId the owner
     * @return The ship ID and ship object.
     * @private
     */
    static async _generate(playerId, getLine) {
        const [ shipId, xPos, yPos, halite ] = (await getLine())
              .split(/\s+/)
              .map(x => parseInt(x, 10));
        return [ shipId, new Ship(playerId, shipId, new Position(xPos, yPos), halite) ];
    }

    toString() {
        return `${this.constructor.name}(id=${this.id}, ${this.position}, cargo=${this.haliteAmount} halite)`;
    }

    r_getBestDirection(actualPosition, gameMap, range) {

        if (range < 0 ) { //Base Case
            gameMap.get(actualPosition).markVisited(true);
            return gameMap.get(actualPosition).haliteAmount;
        }
        else {
            var haliteNorth = haliteSouth = haliteEast = haliteWest = gameMap.get(actualPosition).haliteAmount;

            if (!gameMap.get(actualPosition.directionalOffset(Direction.North)).getVisited()) {
                gameMap.get(actualPosition.directionalOffset(Direction.North)).markVisited(true);
                haliteNorth += this.r_getBestDirection(actualPosition.directionalOffset(Direction.North), gameMap, --range);
            }
            if (!gameMap.get(actualPosition.directionalOffset(Direction.South)).getVisited()) {
                gameMap.get(actualPosition.directionalOffset(Direction.South)).markVisited(true);
                haliteSouth += this.r_getBestDirection(actualPosition.directionalOffset(Direction.South), gameMap, --range);
            }
            if (!gameMap.get(actualPosition.directionalOffset(Direction.East)).getVisited()) {
                gameMap.get(actualPosition.directionalOffset(Direction.East)).markVisited(true);
                haliteEast += this.r_getBestDirection(actualPosition.directionalOffset(Direction.East), gameMap, --range);
            }
            if (!gameMap.get(actualPosition.directionalOffset(Direction.West)).getVisited()) {
                gameMap.get(actualPosition.directionalOffset(Direction.West)).markVisited(true);
                haliteWest += this.r_getBestDirection(actualPosition.directionalOffset(Direction.West), gameMap, --range);
            }
           
            return Math.max(haliteNorth, haliteSouth, haliteEast, haliteWest);
        }
    }

     /**
     * Get the better action for a ship individualy.
     * @param actualPosition is the actual position of the ship
     * @param gameMap is the map of the game
     * @param range is the maximum number of turns that we want to analize
     * @returns the direction (North, South, East, West)
     */
    getBestDirection(actualPosition, gameMap, range) {

        // let possibleDirections = [Direction.North, Direction.South, Direction.East, Direction.West, Direction.Still]; 
        var haliteNorth = this.r_getBestDirection(actualPosition.directionalOffset(Direction.North), gameMap, --range);
        var haliteSouth = this.r_getBestDirection(actualPosition.directionalOffset(Direction.South), gameMap, --range);
        var haliteEast = this.r_getBestDirection(actualPosition.directionalOffset(Direction.East), gameMap, --range);
        var haliteWest = this.r_getBestDirection(actualPosition.directionalOffset(Direction.West), gameMap, --range);
        var halieStill = gameMap.get(actualPosition).haliteAmount;

        if (haliteNorth > haliteSouth && haliteNorth > haliteEast && haliteNorth > haliteWest && haliteNorth > halieStill) return Direction.North;
        else if (haliteSouth > haliteNorth && haliteSouth > haliteEast && haliteSouth > haliteWest && haliteSouth > halieStill) return Direction.South;
        else if (haliteEast > haliteNorth && haliteEast > haliteSouth && haliteEast > haliteWest && haliteEast > halieStill) return Direction.East;
        else if (haliteWest > haliteNorth && haliteWest > haliteSouth && haliteWest > haliteEast && haliteWest > halieStill) return Direction.West;
        else if (halieStill > haliteNorth && halieStill > haliteSouth && halieStill > haliteEast && halieStill > haliteWest) return Direction.Still;
    }
}

module.exports = {
    Entity,
    Ship,
    Dropoff,
    Shipyard,
};
