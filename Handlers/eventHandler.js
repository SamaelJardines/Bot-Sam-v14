const fs = require("fs");

// Find specific (Events) dir
const eventsDir = `${process.cwd()}/events`;

module.exports = client => {

    // Find all files ending with .js
    const events = fs.readdirSync(eventsDir).filter(file => file.endsWith(".js"));

    for (const file of events) {
        // Require a file in dir to load
        const event = require(`${eventsDir}/${file}`);

        // Load event files
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}