const express = require("express");
require("dotenv").config();
const cors = require('cors');
const { getCampaigns, getCampaignDetails } = require("./etherum_utils/CampaignManager");


const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());


app.post("/api/createcampaign/", (req, res) => {});


/*
  This endpoint should return the details of a campaign
*/
app.post("/api/getcampaign/detail/", (req, res) => {
  const { campaignAddress } = req.body;
  console.log(campaignAddress);
  getCampaignDetails(campaignAddress)
    .then((campaignDetails) => {
      res.json(campaignDetails);
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
});

app.get("/api/getcampaigns/", (_, res) => {
  getCampaigns()
    .then((campaigns) => {
      res.json(campaigns);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
