const puppeteer = require('puppeteer');
const fs = require("fs");
const jsonfile = require('jsonfile')
const request = require('request');
const ig = require('./IGUtils')

var forLongPolling = []
var gotResults = false


async function scoreThem(name){
 forLongPolling = await hereWeGo(name)
 //forLongPolling = "hijoepucha!"
 gotResults = true
}

function checkResults(){
  if(gotResults){
    console.log(forLongPolling)
    return forLongPolling
  } else {
    console.log("not yet buddy!")
    return "not yet buddy!"

  }

}


async function hereWeGo(who) {
  const browser = await puppeteer.launch({headless: false, slowMo: 100});
  const page = await browser.newPage();

          // log in
        await ig.logMeIn(page)

         profiles = await ig.listFollowers(page, who)


    async function getRawPics(){
      unfollow_suggestion = []
      var i;
      for (i = 0; i < 9; i++) {
        name = profiles[i]
        r = await ig.mapOverPics(page, name, ig.sexyness_level)
        b = r.filter(x => x.nudity.raw > 0.5)
        if (b.length >= 5) {
          unfollow_suggestion.push(name)
        } 
      }
      console.log(unfollow_suggestion)
      return unfollow_suggestion
        
    }
    return getRawPics()

 
}

exports.hereWeGo = hereWeGo
exports.scoreThem = scoreThem
exports.checkResults = checkResults

