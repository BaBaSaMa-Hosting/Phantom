const fs = require('../node_modules/fs');
const path = require('../node_modules/path');
const phantom = require('../node_modules/phantom');
const fastify = require('../node_modules/fastify') ({
    logger: true
});

fastify.get('/', async (request, reply) => {
    let link = request.headers.link;
    if (link === null || link === undefined || link.trim() === "") {
        reply.send("Please pass in a header link")
    } else{
        if (!link.includes("https://") && !link.includes("http://")) {
            link = `https://${link}`
        }
        const instance = await phantom.create();
        const page = await instance.createPage();
        await page.on("onResourceRequested", (requestData) => {
            console.info('Requesting', requestData.url);
        });

        const status = await page.open(link);
        reply.headers("phantom-status", status);

        const content = await page.property('content');
        reply.send(content);

        instance.exit();
    }
});

const start = async() => {
    await fastify.register(require('../node_modules/middie'))
    fastify.use(require('../node_modules/cors')())

    await fastify.listen(3002, '0.0.0.0')
    .then((address) => console.log(`server is listening on ${address}`))
    .catch(err => {
        console.log('error starting server: ', err);
        process.exit(1);
    });
}
start();

