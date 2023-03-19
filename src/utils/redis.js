const redis = require("redis");

const db = {}
async function init() {
    let redisClient = redis.createClient({
        url: "redis://:u8yFi16D0bmUtQl3Srm@194.87.199.28:52412"
    });
  
    redisClient.on("error", (error) => console.error(`Error : ${error}`));
  
    redisClient.on("connect", () => {
        console.log('✅ connect redis success !')
    })
    await redisClient.connect();
    return redisClient
}
db.redis = redis;
db.init = init;

module.exports = db;