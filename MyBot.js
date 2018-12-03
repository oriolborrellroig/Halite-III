const hlt = require('./hlt');
const { Direction } = require('./hlt/positionals');
const logging = require('./hlt/logging');

const geneticAlgorithm = new hlt.GeneticAlgorithm();
const game = new hlt.Game();


game.initialize().then(async () => {
    // At this point "game" variable is populated with initial map data.
    // This is a good place to do computationally expensive start-up pre-processing.
    // As soon as you call "ready" function below, the 2 second per turn timer will start.
    await game.ready('GeneticBot');
    logging.info(`My Player ID is ${game.myId}.`);
    var oneShip = false;
    while (true) {
        await game.updateFrame();

        const { gameMap, me } = game;
        const { algorithm } = geneticAlgorithm;
        const commandQueue = [];

        geneticAlgorithm.setGameMap(gameMap);

        for (const ship of me.getShips()) {
            if (ship.haliteAmount > hlt.constants.MAX_HALITE / 2) {
                const destination = me.shipyard.position;
                const safeMove = gameMap.naiveNavigate(ship, destination);
                commandQueue.push(ship.move(safeMove));
            }
            else if (gameMap.get(ship.position).haliteAmount < hlt.constants.MAX_HALITE / 10) {
                const direction = geneticAlgorithm.calculateNewDirection(ship.position)
                const destination = ship.position.directionalOffset(direction);
                const safeMove = gameMap.naiveNavigate(ship, destination);
                commandQueue.push(ship.move(safeMove));
            }
        }


        if (!oneShip) {
            commandQueue.push(me.shipyard.spawn());
            oneShip = true;
        }

        await game.endTurn(commandQueue);
    }
});
