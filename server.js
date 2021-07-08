const { app, log } = require('./index');
const port = process.env.PORT || 3000;

app.listen(port, () => {
    log.info(`listening on port ${port}`)
})