/**
 * RESTful Twitter api supporting tweets and users resource collections
 *
 * @author      Nathalie Junker, Jannik Portz, Dennis Ritter
 */
const app = require('./src/app');

const PORT = 3000;

// Start express server on PORT
app.listen(PORT, (err) => {
    if (!!err) {
        console.error(`Error starting server`, err);
        process.exit(1);
    }

    console.log(`Express server listening on port ${PORT}`);
});