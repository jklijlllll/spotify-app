const express = require("express");
const request = require("request");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const router = express.Router();

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

// TODO: change redirect_uri
// TODO: add token refresh
var access_token;
var token_expiry_time;
var refresh_token;

var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get("/login", (req, res) => {
  var scope =
    "streaming \
               user-read-email \
               user-read-private";

  var state = generateRandomString(16);

  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: "http://localhost:3000/auth/callback",
    state: state,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize/?" +
      auth_query_parameters.toString()
  );
});

router.get("/callback", (req, res) => {
  var code = req.query.code;

  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: "http://localhost:3000/auth/callback",
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(spotify_client_id + ":" + spotify_client_secret).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (error === null && response.statusCode === 200) {
      access_token = body.access_token;
      token_expiry_time = Date.now() + body.expires_in * 1000;
      refresh_token = body.refresh_token;
      res.redirect("/");
    }
  });
});

router.get("/token", (req, res) => {
  res.json({
    access_token: access_token,
    refresh_token: refresh_token,
    token_expiry_time: token_expiry_time,
  });
});

router.get("/refresh_token", (req, res) => {
  var authOptions = {
    url: "http://accounts.spotify.com/api/token",
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(spotify_client_id + ":" + spotify_client_secret).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (error === null && response.statusCode === 200) {
      access_token = body.access_token;
      token_expiry_time = Date.now() + body.expires_in * 1000;
      refresh_token = body.refresh_token;

      res.json({
        access_token: access_token,
        token_expiry_time: token_expiry_time,
      });
    }
  });
});

module.exports = router;
