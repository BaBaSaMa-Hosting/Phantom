const { exec } = require('child_process');
const fastify = require('fastify') ({
    logger: true
});

fastify.get('/', async (request, reply) => {
    let link = request.headers.link;
    if (link === null || link === undefined || link.trim() === "") {
        reply.send("Please pass in a header link")
    } else{
        if (!link.includes("https://") && !link.includes("http://"))
            link = `https://${link}`

        let now = + new Date();
        exec(`phantomjs /var/www/rasterize.js ${link} /media/sda2/phantomjs/${now}.png`, (error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) 
                console.log(`exec error: ${error}`);
        });
    }
});

const start = async() => {
    await fastify.register(require('middie'))
    fastify.use(require('cors')())

    await fastify.listen(3002, '0.0.0.0')
    .then((address) => console.log(`server is listening on ${address}`))
    .catch(err => {
        console.log('error starting server: ', err);
        process.exit(1);
    });
}
start();

