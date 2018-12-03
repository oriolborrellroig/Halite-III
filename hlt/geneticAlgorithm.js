const { Direction } = require('./positionals');
const logging = require('./logging');

class GeneticAlgorithm {
    constructor() {
        this.TURNS_FOR_POPULATION = 4;
        //Size of the population that will be generated.
        this.POPULATION_SIZE = 10;
        //Number of generations. If we don't have any feasible code generations, a new guess with new generations and populations will be made.
        this.GENERATION_SIZE = 10;
        //Max number of feasible codes. When the FEASIBLE_CODES_MAX is reached, we stop producing feasible codes and we choose one randomly
        this.FEASIBLE_CODES_MAX = 1;
        //Array with the lasts moves
        this.lastMoves = [];
        //Array with the feasible moves
        this.feasibleMoves = [];
        //Array with the population
        this.population = [];
        //Array with the fitness
        this.fitness = [];
        //The map of the game;
        this.gameMap;
    }

    setGameMap(gameMap) {
        this.gameMap = gameMap;
    }

    calculateNewDirection(initialPosition) {
        var generation = 0;
        var feasibleNotFull = true;
        this.initializePopulation();
        this.calculateFitness(initialPosition);
        logging.info("Population: " + this.population);
        logging.info("Fitness: " + this.fitness);
        return Direction.North;
    }

    initializePopulation() {
        this.feasibleMoves = []
        this.population = [];
        this.fitness = [];

        for(var i = 0; i < this.POPULATION_SIZE; ++i) {
            this.fitness.push(0);
            var newPopulation = this.generateNewRandomPopulation()
            this.population.push(newPopulation);
        }
    }

    generateNewRandomPopulation() {
        var newPopulation = [];
        for(var i = 0; i < this.TURNS_FOR_POPULATION; ++i) {
            newPopulation.push(Direction.getAllCardinals()[Math.floor(4 * Math.random())]);
        }
        return newPopulation;
    }

    calculateFitness(position) {
        for (var i = 0; i < this.POPULATION_SIZE; i++) {
            var calculatedFitness = 0;
            var initialPosition = position
            for (var j = 0; j < this.TURNS_FOR_POPULATION; j++) {
                calculatedFitness += this.gameMap.get(initialPosition.directionalOffset(this.population[i][j])).haliteAmount;
                position.directionalOffset(this.population[i][j]);
            }
            this.fitness[i] = calculatedFitness;

        }
    }
}

module.exports = {
    GeneticAlgorithm,
};
