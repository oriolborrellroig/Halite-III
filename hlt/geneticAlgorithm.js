const { Direction } = require('./positionals');
const logging = require('./logging');

class GeneticAlgorithm {
    constructor() {
        this.TURNS_FOR_POPULATION = 1;
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
        this.populationArray = [];
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
        this.sortFeasibleByFitness();
        while (feasibleMoves.lenght <= 0) {
            generation = 0;
            while (feasibleNotFull && generation <= GENERATION_SIZE) {
                this.evolvePopulation();
                this.calculateFitness(initialPosition);
                this.sortFeasibleByFitness();
                feasibleNotFull = addToFeasibleCodes();
                ++generation;
            }
        }


        return Direction.North;
    }

    initializePopulation() {
        this.feasibleMoves = []
        this.populationArray = [];

        for(var i = 0; i < this.POPULATION_SIZE; ++i) {
            var newDirections = this.generateNewRandomPopulation()
            var newPopulation = {'population': newDirections, 'fitness': 0};
            this.populationArray.push(newPopulation);
        }
    }

    generateNewRandomPopulation() {
        var newDirections = [];
        for(var i = 0; i < this.TURNS_FOR_POPULATION; ++i) {
            newDirections.push(Direction.getAllCardinals()[Math.floor(4 * Math.random())]);
        }
        return newDirections;
    }

    calculateFitness(position) {
        for (var i = 0; i < this.POPULATION_SIZE; i++) {
            var calculatedFitness = 0;
            var initialPosition = position
            for (var j = 0; j < this.TURNS_FOR_POPULATION; j++) {
                calculatedFitness += this.gameMap.get(initialPosition.directionalOffset(this.populationArray[i].population[j])).haliteAmount;
                position.directionalOffset(this.populationArray[i].population[j]);
            }
            this.populationArray[i].fitness = calculatedFitness;

        }
    }

    sortFeasibleByFitness() {
        this.populationArray.sort(function (a, b) {
            if (a.fitness > b.fitness) {
                return 1;
            }
            if (a.fitness < b.fitness) {
                return -1;
            }
            // a must be equal to b
            return 0;
        });
        
    }

    evolvePopulation() {
        var newPopulationArray = [];

        //Crossovers
        for (var i = 0; i < POPULATION_SIZE; i += 2) {
            if (Math.floor(2 * Math.random()) == 0) {
                //TODO: Uninplemented Method
                this.crossover1Point();
            } else {
                //TODO: Uninplemented Method
                this.crossover2Points();
            }
        }

        //Mutation, Permutation and Inversion
        for (var i = 0; i < POPULATION_SIZE; i++) {
            if (Math.floor(100 * Math.random()) < 3) {
                //TODO: Uninplemented Method
                this.mutation();
            } else if (Math.floor(100 * Math.random()) < 3) {
                //TODO: Uninplemented Method
                this.permutation();
            } else if (Math.floor(100 * Math.random()) < 2) {
                //TODO: Uninplemented Method
                this.inversion();
            }
        }

        //TODO: Uninplemented Method
        this.repetitionsToRandom();

        this.populationArray = newPopulationArray;
    }



//    getParentPos() {
//         parentPos += Math.floor(7 * Math.random());
//         if (parentPos < POPULATION_SIZE / 5) {
//             return parentPos;
//         } else {
//             parentPos = 0;
//         }
//         return parentPos;
//     }
}

module.exports = {
    GeneticAlgorithm,
};
