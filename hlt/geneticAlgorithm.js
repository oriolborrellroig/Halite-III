const { Direction } = require('./positionals');
const logging = require('./logging');

class GeneticAlgorithm {
    constructor() {
        this.TURNS_FOR_POPULATION = 10;
        //Size of the population that will be generated.
        this.POPULATION_SIZE = 70;
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

        this.player;
        this.parentPos = 0;
    }

    setGameMap(gameMap) {
        this.gameMap = gameMap;
    }

    setPlayer(player) {
        this.player = player;
    }

    calculateNewDirection(initialPosition) {
        var generation = 0;
        var feasibleNotFull = true;
        this.initializePopulation();
        this.calculateFitness(initialPosition);
        this.sortFeasibleByFitness();
        while (this.feasibleMoves.length <= 0) {
            generation = 0;
            while (feasibleNotFull && (generation <= this.GENERATION_SIZE)) {
                this.evolvePopulation();
                this.calculateFitness(initialPosition);
                this.sortFeasibleByFitness();
                feasibleNotFull = this.addToFeasibleCodes();
                ++generation;
            }
        }

        var randomPodition = Math.floor(this.FEASIBLE_CODES_MAX * Math.random());

        return this.feasibleMoves[randomPodition].population[0];
    }

    initializePopulation() {
        this.feasibleMoves = []
        this.populationArray = [];

        for(var i = 0; i < this.POPULATION_SIZE; ++i) {
            var newDirections = this.generateNewRandomPopulation()
            var newPopulation = new DirectionArrayFitness(newDirections, 0);
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
                calculatedFitness += (25 / 100) * this.gameMap.get(initialPosition.directionalOffset(this.populationArray[i].population[j])).haliteAmount;
                calculatedFitness += (75 / 100) * this.player.halite_amount;
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

        var newPopulationArray = this.populationArray.slice(0);

        //Crossovers
        for (var i = 0; i < this.POPULATION_SIZE; i += 2) {
            if (Math.floor(2 * Math.random()) == 0) {
                newPopulationArray = this.crossover1Point(newPopulationArray, i, i + 1);
            } else {
                newPopulationArray = this.crossover2Point(newPopulationArray, i, i + 1);
            }
        }

        //Mutation, Permutation and Inversion
        for (var i = 0; i < this.POPULATION_SIZE; i++) {
            if (Math.floor(100 * Math.random()) < 3) {
                this.mutation(newPopulationArray, i);
            } else if (Math.floor(100 * Math.random()) < 3) {
                this.permutation(newPopulationArray, i);
            } else if (Math.floor(100 * Math.random()) < 2) {
                this.inversion(newPopulationArray, i);
            }
        }

        //TODO: Uninplemented Method
        // this.repetitionsToRandom();
        
        this.populationArray = newPopulationArray;
    }

    crossover1Point(newPopulationArray, child1Pos, child2Pos) {

        var mother = this.getParentPos();
        var father = this.getParentPos();

        var sep = Math.floor(this.TURNS_FOR_POPULATION * Math.random()) + 1;

        for (var j = 0; j < this.TURNS_FOR_POPULATION; j++) {
            if (j <= sep) {
                newPopulationArray[child1Pos].population[j] = this.populationArray[mother].population[j];
                newPopulationArray[child2Pos].population[j] = this.populationArray[father].population[j];
            } else { 
                newPopulationArray[child1Pos].population[j] = this.populationArray[father].population[j];
                newPopulationArray[child2Pos].population[j] = this.populationArray[mother].population[j];
            }
        }

        return newPopulationArray;
    }

    crossover2Point(newPopulationArray, child1Pos, child2Pos) {

        var mother = this.getParentPos();
        var father = this.getParentPos();
        var sep1 = Math.floor(this.TURNS_FOR_POPULATION * Math.random()) + 1;
        var sep2 = Math.floor(this.TURNS_FOR_POPULATION * Math.random()) + 1;

        if (sep1 > sep2) {
            let temporalVariable = sep1;
            sep1 = sep2;
            sep2 = temporalVariable;
        }

        for (var i = 0; i < this.TURNS_FOR_POPULATION; i++) {
            if (i <= sep1 || i > sep2) {
                newPopulationArray[child1Pos].population[i] = this.populationArray[mother].population[i];
                newPopulationArray[child2Pos].population[i] = this.populationArray[father].population[i];
            } else {
                newPopulationArray[child1Pos].population[i] = this.populationArray[father].population[i];
                newPopulationArray[child2Pos].population[i] = this.populationArray[mother].population[i];
            }
        }

        return newPopulationArray;
    }

   getParentPos() {
        this.parentPos += Math.floor(7 * Math.random());
        if (this.parentPos < this.POPULATION_SIZE / 5) {
            return this.parentPos;
        } else {
            this.parentPos = 0;
        }
        return this.parentPos;
    }

    mutation(newPopulationArray, populationPosition) {
        var pos = Math.floor( this.TURNS_FOR_POPULATION * Math.random());
        newPopulationArray[populationPosition].population[pos] = Direction.getAllCardinals()[Math.floor(4 * Math.random())];
    }

    permutation(newPopulationArray, populationPosition) {
        var pos1 = Math.floor( this.TURNS_FOR_POPULATION * Math.random());
        var pos2 = Math.floor( this.TURNS_FOR_POPULATION * Math.random());
        var temporalDirection = newPopulationArray[populationPosition].population[pos1];
        var temporalPopulation = newPopulationArray[populationPosition].population;

        newPopulationArray[populationPosition].population[pos1] = temporalPopulation[pos2];
        newPopulationArray[populationPosition].population[pos2] = temporalDirection;
    }

    inversion(newPopulationArray, populationPosition) {
        var pos1 = Math.floor( this.TURNS_FOR_POPULATION * Math.random());
        var pos2 = Math.floor( this.TURNS_FOR_POPULATION * Math.random());

        if (pos2 < pos1) {
            let temporalVariable = pos2;
            pos2 = pos1;
            pos1 = temporalVariable;
        }

        for (var i = 0; i < (pos2 - pos1) / 2; i++) {
            var temporalDirection = newPopulationArray[populationPosition].population[pos1 + i];
            newPopulationArray[populationPosition].population[pos1 + i] = newPopulationArray[populationPosition].population[pos2 - i];
            newPopulationArray[populationPosition].population[pos2 - i] = temporalDirection;
        }
    }

    addToFeasibleCodes() {
        
        for (var i = 0; i < this.POPULATION_SIZE; i++) {
            var totalFitness = 0;
            for (var j = 0; j < this.TURNS_FOR_POPULATION; j++) {
                totalFitness += this.populationArray[i].fitness[j];
            }
            if (this.feasibleMoves.length <= this.FEASIBLE_CODES_MAX) {
                this.feasibleMoves.push(this.populationArray[i]);
                if (this.feasibleMoves.length < this.FEASIBLE_CODES_MAX) {
                    return false;
                }
            } else {
                // E is full.
                return false;
            }
        }
        return true;
    }
}

class DirectionArrayFitness {
    constructor(populationArray, fitness) {
        this.population = populationArray;
        this.fitness = fitness
    }
}

module.exports = {
    GeneticAlgorithm,
    DirectionArrayFitness
};
