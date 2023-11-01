const express = require("express");
const hbs = require("hbs");
const path = require("path");
const geocode = require("./utils/geocode");
const forecast = require("./utils/prediksiCuaca");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;
//Define paths for Express config
const publicDirectoryPath = path.join(__dirname, "../public");
const viewPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

//handlebars engine and view location
app.set("view engine", "hbs");
app.set("views", viewPath);
hbs.registerPartials(partialsPath);

//setup static directory to serve
app.use(express.static(publicDirectoryPath));

app.get("", (req, res) => {
  res.render("index", {
    title: "Aplikasi Cek Cuaca",
    name: "Muhammad Asyrof",
  });
});

// Halaman Tentang Saya
app.get("/tentang", (req, res) => {
  res.render("tentang", {
    title: "Who Am I?",
    name: "Muhammad Asyrof",
  });
});

//Halaman Berita
app.get("/berita", async (req, res) => {
  try {
    const urlApiMediaStack = "http://api.mediastack.com/v1/news";
    const apiKey = "a2fa3b3057f574d12169896d92ca0bb4";

    const params = {
      access_key: apiKey,
      countries: "id",
    };

    const response = await axios.get(urlApiMediaStack, { params });
    const dataBerita = response.data;

    res.render("berita", {
      name: "Muhammad Asyrof",
      title: "News Update",
      berita: dataBerita.data,
    });
  } catch (error) {
    console.error(error);
    res.render("error", {
      title: "Terjadi Kesalahan",
      pesanKesalahan: "Terjadi kesalahan saat mengambil berita.",
    });
  }
});

//Halaman Bantuan
app.get("/bantuan", (req, res) => {
  res.render("bantuan", {
    title: "FAQ",
    teksBantuan: "Bantuan apa yang anda butuhkan?",
    name: "Muhammad Asyrof",
  });
});

app.get("/infocuaca", (req, res) => {
  if (!req.query.address) {
    return res.send({
      error: "Kamu harus memasukan lokasi yang ingin dicari",
    });
  }
  geocode(
    req.query.address,
    (error, { latitude, longitude, location } = {}) => {
      if (error) {
        return res.send({ error });
      }
      forecast(latitude, longitude, (error, dataPrediksi) => {
        if (error) {
          return res.send({ error });
        }
        res.send({
          prediksiCuaca: dataPrediksi,
          lokasi: location,
          address: req.query.address,
        });
      });
    }
  );
});

app.get("/bantuan/*", (req, res) => {
  res.render("404", {
    title: "404",
    name: "Muhammad Asyrof",
    pesanError: "Belum ada artikel bantuan tersedia",
  });
});

app.get("*", (req, res) => {
  res.render("404", {
    title: "404",
    name: "Muhammad Asyrof",
    pesanError: "Halaman tidak ditemukan",
  });
});

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
