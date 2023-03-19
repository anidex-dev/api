const controller = require("../controllers/search");

module.exports = function(app, rClient) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept, Referrer"
      );
      res.header(
        "x-powered-by",
        "Server"
      );
      next();
    });
  
    
    app.post("/api/search", controller.search)
    app.get("/api/anime/:id/", controller.anime)
    /*app.get("/api/anime/:id/themes", controller.themes)
    app.get("/api/manga/:id/", controller.manga)
    app.get("/api/ranobe/:id/", controller.ranobe)*/

  };