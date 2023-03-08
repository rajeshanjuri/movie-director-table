const express = require("express");
const app = express(); //Creating an instance
app.use(express.json()); // Making express know we are sending json data

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
// Connecting the server and database
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is up and running");
    });
  } catch (e) {
    console.log(`Db error ${e}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertMovieNameSnakeCaseTOCamelCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

// API-1
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
        SELECT movie_name FROM movie ORDER BY movie_id;
    `;
  const moviesList = await db.all(getAllMoviesQuery);
  response.send(
    moviesList.map((eachMovie) =>
      convertMovieNameSnakeCaseTOCamelCase(eachMovie)
    )
  );
});

// API-2
app.post("/movies/", async (request, response) => {
  try {
    const movieDetails = request.body;
    const { directorId, movieName, leadActor } = movieDetails;
    const addMovieQuery = `
        INSERT INTO movie
        (director_id, movie_name ,lead_actor)
        VALUES 
        ('${directorId}','${movieName}','${leadActor}')
        `;
    await db.run(addMovieQuery);
    response.send("Movie Successfully Added");
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
  }
});

const convertSnakeCaseTOCamelCase = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

// API-3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT *
        FROM movie
        WHERE movie_id=${movieId};
    `;
  const movieDetails = await db.get(getMovieQuery);
  response.send(convertSnakeCaseTOCamelCase(movieDetails));
});

// API-4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateBookQuery = `
        UPDATE 
            movie
        SET 
            director_id='${directorId}',
            movie_name='${movieName}',
            lead_actor='${leadActor}'
        WHERE 
            movie_id=${movieId};
    `;
  await db.run(updateBookQuery);
  response.send("Movie Details Updated");
});

//API-5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDirectorSnakeCaseToCamelCase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API-6
app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `
        SELECT * FROM director ORDER BY director_id;
    `;
  const directorList = await db.all(getAllDirectorsQuery);
  response.send(
    directorList.map((eachDirector) =>
      convertDirectorSnakeCaseToCamelCase(eachDirector)
    )
  );
});

//API-7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT movie_name FROM movie WHERE director_id=${directorId};`;
  const directorMovies = await db.all(getDirectorMoviesQuery);
  response.send(
    directorMovies.map((eachDirector) =>
      convertMovieNameSnakeCaseTOCamelCase(eachDirector)
    )
  );
});

module.exports = app;
