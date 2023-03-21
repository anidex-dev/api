const axios = require("axios")
const redis = require("redis");

let redisClient;
(async () => {
  redisClient = redis.createClient({
    url: "redis://:u8yFi16D0bmUtQl3Srm@194.87.199.28:52412"
  });

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  redisClient.on("connect", () => {
    console.log('✅ connect redis success !')
})
  
  await redisClient.connect();
})();


exports.search = async (req, res) => {
    const q = req.body.query 
    const type = req.body.type
    switch (type) {
        case "anime":
            searchAnime(q, res)
        case "manga":
            searchManga(q, res)
        case "ranobe":
            searchRanobe(q,res)
        break
    } 
}

exports.anime = async (req, res) => {
    const id = req.params.id;
    
    let data
    try {
        const cacheResults = await redisClient.get(id)
        if (cacheResults) {
            data = JSON.parse(cacheResults)
        } else {
            data = await getAnime(id).then((data) => {
              return data
            })
            if (data != "not found") {
              await redisClient.set(id, JSON.stringify(data), {
                EX: 604800, //7 дней
                NX: true,
              })
            }
            
            
        }
        if (data == "not found") {
          res.status(404).send({
            ok: false,
            error: "Not Found",
          });
        } else {
          res.status(200).send({
            ok: true,
            data: data,
          });
        }
    } catch(error) {
        res.status(503).send({ok: false, error: "Temporary unavailable."});
        console.error(error)
    }

}

async function getAnime(id) {
  
    
        
        var queryid = `query {
        Media(idMal: ${id}) {
            id
            countryOfOrigin
            description
    coverImage {
      extraLarge
      large
      medium
      color
    }
        bannerImage
      title {
        romaji
        english
        native
        userPreferred
      }
            airingSchedule(notYetAired: true, perPage: 1) {
              nodes {
                airingAt
                episode
              }
            }
            characters {
        edges {
          role
        }
        nodes {
          id
          age
          gender
          
          name {
            first
            middle
            last
            full
            native
            userPreferred
          } 
          dateOfBirth {
            year
            month
            day
          }
          bloodType
          image {
            large
            medium
          }
          
        }
      }
    }
}`
    var varibls = {}
    return axios.all([
        axios.get(`https://kodikapi.com/search?token=f72d17af17189dbbc5f2dd03271c74fc&with_episodes=true&shikimori_id=${id}&with_material_data=true`),
        axios.get(`https://smotret-anime.ru/api/series?myAnimeListId=${id}`),
        axios.get(`https://arm.haglund.dev/api/v2/ids?source=myanimelist&id=${id}`),
        axios.get(`https://api.jikan.moe/v4/anime/${id}/full`),
        axios({
          method: 'post',
          url: "https://graphql.anilist.co/",
          data: {
            query: queryid,
            variables: varibls
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          }
        })
    ])
      .then(axios.spread((datakp, datas, datam, data, dataid) => {
        
        try {
        var kp_poster = datakp.data.results[0].material_data.poster_url
        var kp_slogan = datakp.data.results[0].material_data.slogan
        var kp_rates = datakp.data.results[0].material_data.kinopoisk_rating
        var kp_votes = datakp.data.results[0].material_data.kinopoisk_votes
        var kp_preview = `https://st.kp.yandex.net/images/film_iphone/iphone360_${datakp.data.results[0].kinopoisk_id}.jpg`
        var shiki_rates = datakp.data.results[0].material_data.shikimori_rating
        var shiki_votes = datakp.data.results[0].material_data.shikimori_votes
        var imdb_rates = datakp.data.results[0].material_data.imdb_rating
        var imdb_votes = datakp.data.results[0].material_data.imdb_votes
        var kp_desc = datakp.data.results[0].material_data.description
        var sh_desc = datakp.data.results[0].material_data.anime_description
        var kp_id = datakp.data.results[0].kinopoisk_id
        var imdb_id = datakp.data.results[0].imdb_id




        } catch {
        var kp_poster = null
        var kp_slogan = null
        var kp_rates = null
        var kp_votes = null
        var kp_preview = null
        var shiki_rates = null
        var shiki_votes = null
        var imdb_votes = null
        var imdb_rates = null
        var kp_desc = null
        var sh_desc = null
        var kp_id = null
        var imdb_id = null
       }
       try {
           var anime_planet = datam.data["anime-planet"]
           var anisearch = datam.data.anisearch
           var kitsu = datam.data.kitsu
           var notify_moe = datam.data["notify-moe"]
           var themoviedb = datam.data.themoviedb
           var thetvdb = datam.data.thetvdb
       } catch {
        var anime_planet = null
        var anisearch = null
        var kitsu = null
        var notify_moe = null
        var themoviedb = null
        var thetvdb = null
       }

var descriptions = datas.data.data[0].descriptions


var result = 0;



try {
   var anilist_id = dataid.data.data.Media.id
   var chr = dataid.data.data.Media.characters
   var chrt = []



for(var i = 0; i < chr.nodes.length;i++) {
var role = chr.edges[i].role
var gender = chr.nodes[i].gender
switch (role) {
case "MAIN":
  role = "Главный"
  break
case "SUPPORTING":
  role = "Вспомогательный"
  break
case "BACKGROUND":
  role = "Фоновый"
  break
}
switch (gender) {
case "Male":
  gender = "Мужской"
  break
case "Female":
  gender = "Женский"
  break
}
chrt.push({
id: chr.nodes[i].id,
name: chr.nodes[i].name.full,
name_jp: chr.nodes[i].name.native,
role: role,
pic: chr.nodes[i].image,
bloodType: chr.nodes[i].bloodType,
birthday: chr.nodes[i].dateOfBirth,
age: chr.nodes[i].age

})
}  


var title_en = dataid.data.data.Media.title.english
var country = dataid.data.data.Media.countryOfOrigin
} 

catch {
   var anilist_id = null
   var chrt = []
   var title_en = null
   var country = null
}


try {
  var posters = dataid.data.data.Media.coverImage
  var banner = dataid.data.data.Media.bannerImage
  var color = dataid.data.data.Media.coverImage.color
  delete posters.color
} catch {
  var posters = null
  var banner = null
  var color = null
} 


if (dataid.data.data.Media.airingSchedule.nodes) {

   var airing_ep = dataid.data.data.Media.airingSchedule.nodes[0]
} else {
   var airing_ep = null
}



var result = 0;




if (descriptions) {
  for(var c = 0; c < descriptions.length;c++) {
    delete descriptions[c].updatedDateTime
          if (descriptions[c].source == "shikimori.org") {
               descriptions[c].source = "shikimori.one"
          }

  }
  if (kp_desc != null && kp_desc != sh_desc) {
    descriptions.push({
      source: "kinopoisk.ru",
      value: kp_desc
    })
  }


}

var fansubs = parseFloat(datas.data.data[0].fansubsId)
/*
var similar = []
if (datasim.data <= 5) {

for(var c = 0; c < 5;c++) {
  similar.push(
    {
      id: datasim.data[c].id,
      titles: {
        russian: datasim.data[c].russian,
        english: datasim.data[c].name
      },
      poster: `https://shikimori.one${datasim.data[c].image.original}`,
      score: parseFloat(datasim.data[c].score),
      episodes_text: datasim.data[c].status == "released" && datasim.data[c].episodes_aired == 0 || datasim.data[c].status == "released" ? `${datasim.data[c].episodes} ${datasim.data[c].episodes == 1 ? "эпизод" : "эпизодов"}` : `${datasim.data[c].episodes_aired} из ${datasim.data[c].episodes} эпизодов`
    }
  )
}
} else {
for(var c = 0; c < datasim.data.length;c++) {
  similar.push(
    {
      id: datasim.data[c].id,
      titles: {
        russian: datasim.data[c].russian,
        english: datasim.data[c].name
      },
      poster: `https://shikimori.one${datasim.data[c].image.original}`,
      score: parseFloat(datasim.data[c].score),
      episodes_text: datasim.data[c].status == "released" && datasim.data[c].episodes_aired == 0 || datasim.data[c].status == "released" ? `${datasim.data[c].episodes} ${datasim.data[c].episodes == 1 ? "эпизод" : "эпизодов"}` : `${datasim.data[c].episodes_aired} из ${datasim.data[c].episodes} эпизодов`
    }
  )
}
}*/


// const characters = getcharact(id)
// Прод не я уронил, честно


var genres = []
for(var c = 0; c < datas.data.data[0].genres.length;c++) {
  genres.push({
    id: datas.data.data[0].genres[c].id,
    name: datas.data.data[0].genres[c].title
  })
}

var studios = []
for(var c = 0; c < data.data.data.studios.length;c++) {
  studios.push(
    {
      id: data.data.data.studios[c].mal_id,
      name: data.data.data.studios[c].name
      
    }
  )
}
switch(data.data.data.rating.split(" -")[0]) {
  case "G":
    var rating = "G"
    var rating_desc = "Нет возрастных ограничений"
break
  case "PG":
    var rating = "PG"
    var rating_desc = "Рекомендуется присутствие родителей"
break
  case "PG-13":
    var rating = "PG-13"
    var rating_desc = "Детям до 13 лет просмотр нежелателен"
break
  case "R":
    var rating = "R-17"
    var rating_desc = "Лицам до 17 лет обязательно присутствие взрослого"
break
  default:
    var rating = null
    var rating_desc = null
break
}


        const resultat = {
            titles: {
              russian: datas.data.data[0].titles.ru,
              english: title_en,
              original: datas.data.data[0].titles.ja,
              romaji: datas.data.data[0].titles.romaji
            },
            posters: {
              anime365: {
                normal: datas.data.data[0].posterUrl,
                preview: datas.data.data[0].posterUrlSmall
              },
              mal: data.data.data.images,
              kinopoisk: {
                normal: kp_poster,
                preview: kp_preview
              },
              anilist: {
                posters: posters,
                banner: banner
            }
              
            },
            rates: {
              kinopoisk: {
                  score: (kp_rates != undefined) ? kp_rates : null,
                  votes_count: (kp_votes != undefined) ? kp_votes : null
              },
              shikimori: {
                score: shiki_rates,
                votes_count: shiki_votes,
              },
              imdb: {
                  score: (imdb_rates != undefined) ? imdb_rates : null,
                  votes_count: (imdb_votes != undefined) ? imdb_votes : null
              },
                  worldart: {
                    score: (datas.data.data[0].worldArtScore == "-1") ? null : parseFloat(datas.data.data[0].worldArtScore)
                  },
                  mal: {
                    score: parseFloat(datas.data.data[0].myAnimeListScore)
                  }
            },
            studios: studios,
            genres: genres,
            descriptions: {
              ru: descriptions,
              en: [
                {
                  source: "myanimelist.net",
                  value: data.data.data.synopsis
                },
                {
                  source: "anilist.co",
                  value: dataid.data.data.Media.description
                }
              ]
            },
            rating: {
              type: rating,
              description: rating_desc
            },
            airing: {
              is_airing_now: data.data.data.airing,
              airing_ep: airing_ep == undefined ? null : airing_ep,
              aired: data.data.data.aired.prop
            },
            season: {
              label: datas.data.data[0].season,
              year: datas.data.data[0].year
            },
            meta: {
              slogan: kp_slogan == undefined ? null : kp_slogan,
              origin_country: country,
              duration: data.data.data.duration.replace("hr", "час").replace("min", "минут").replace(" per ep", "/эпизод"),
              episodes_count: datas.data.data[0].numberOfEpisodes,
              titles: datas.data.data[0].allTitles,
              color: color
            },
            services: {
              shikimori: data.data.data.mal_id,
              mal: data.data.data.mal_id,
              anime365: datas.data.data[0].id,
              worldart: datas.data.data[0].worldArtId == 0 ? null : datas.data.data[0].worldArtId,
              anidb: datas.data.data[0].aniDbId == 0 ? null : datas.data.data[0].aniDbId,
              ann: datas.data.data[0].animeNewsNetworkId == 0 ? null : datas.data.data[0].animeNewsNetworkId,
              fansubs: fansubs == 0 ? null : fansubs,
              kinopoisk: parseInt(kp_id),
              anilist: dataid.data.data.Media.id,
              imdb: imdb_id,
              animeplanet: anime_planet,
              thetvdb: thetvdb,
              themoviedb: themoviedb,
              kitsu: kitsu,
              anisearch: anisearch,
              notify_moe: notify_moe

              
            }
            



          }
          
          return resultat

      }))
      .catch((err) => {
        return "not found"
      })
    
}

function searchAnime(q, res) {

}

function searchRanobe(q, res) {

}

function searchManga(q, res) {

}