const puppeteer = require('puppeteer');
const request = require('request');
const fs = require("fs");
var sightengine = require('sightengine')('', '');


async function logMeIn(mypage, user, pass){
    await mypage.goto('https://www.instagram.com/accounts/login/', {"waitUntil" : "networkidle0"});
    await mypage.waitForSelector('input[name="username"]');
    await mypage.type('input[name="username"]', '@' + user);
    await mypage.type('input[name="password"]', pass);
    await mypage.click('button[type="submit"]');
    await mypage.waitForNavigation();
        // handle anoying popup
        const notNow = "body > div.RnEpo.Yx5HN > div > div > div.mt3GC > button.aOOlW.HoLwm"
        await mypage.click(notNow);
        return
}

async function search_v1(mypage, word){
    const search_selector = '#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.LWmhU._0aCwM > input'

    await mypage.type(search_selector, word)
    await (await mypage.$(search_selector)).press('Enter');
    await (await mypage.$(search_selector)).press('Enter');
    return
}
// this must return the quantity found if found any
async function search(mypage, word){
    goto_search = 'https://www.instagram.com/explore/tags/' + word + '/'
    await mypage.goto(goto_search, {"waitUntil" : "networkidle0"})
}

function extractItems(){
    return Array.from(document.querySelectorAll('.FFVAD'))
        .map(elem => String(elem.src))
  
  }

  async function scrapeInfiniteScroll(myPage,
    extractItems,
     itemTargetCount,
     scrollDelay = 1000){
       let mySet = new Set()
       let items = await myPage.evaluate(extractItems);
       items.forEach(item => mySet.add(item))
         try {
             let previousHeight;
           while (mySet.size < itemTargetCount) {
             items = await myPage.evaluate(extractItems);
             items.forEach(item => mySet.add(item))
             previousHeight = await myPage.evaluate('document.body.scrollHeight');
             await myPage.evaluate('window.scrollTo(0, document.body.scrollHeight)');
             await myPage.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
             await myPage.waitFor(scrollDelay);
           }
         } catch(e) { }
     return Array.from(mySet);
     }

     function delay(t, data) {
        return new Promise(resolve => {
            setTimeout(resolve.bind(null, data), t);
        });
      }

     async function mapStep_downloadFileAsync(elem, idx, name){
        return request(elem).pipe(fs.createWriteStream('picDB/'+ name + ''+ idx +'.png'))
      }
          // this is a kind of delayed async map operation
          // try to abstract this later, passing the  'func' you want evaluated.
           function recurse(array, nameOfFile) {
            let index = 0;
            function next() {
              if (index < array.length) {
                return mapStep_downloadFileAsync(array[index++], index, nameOfFile)
                    .then(function() {
                        return delay(100).then(next);
                    });
                }        
            }
            return Promise.resolve().then(next);
        }


async function listFollowers(myPage, who){
        following = '#react-root > section > main > div > header > section > ul > li:nth-child(3)'
        await myPage.goto('https://www.instagram.com/' + who, {"waitUntil" : "networkidle0"});
        await myPage.waitForSelector(following);

        numOfFollowers = await myPage.evaluate(() => {
          return document
          .querySelector('#react-root > section > main > div > header > section > ul > li:nth-child(3)')
          .innerText.split(" ")[0]
        })

      
        await myPage.click(following);
        await myPage.waitForSelector("body > div.RnEpo.Yx5HN > div");
      
        const pages = await myPage.browser().pages()
        const popup = pages[pages.length - 1];
        // maybe add the popup as an argument to the next
        // two funcs
         async function getProfiles(){ 
           myList = await popup.evaluate( () => 
                Array.from(document.querySelectorAll('body > div.RnEpo.Yx5HN > div > div.isgrP > ul > div > li'), 
                e => e.innerText));
              return myList
              }
        async function scroller(){
          await popup.$eval('body > div.RnEpo.Yx5HN > div > div.isgrP > ul > div', function(thing){
            thing.scrollIntoView({ behavior: 'smooth', block: 'end'})
            return thing
          })
      }
      
      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      
      async function getAllMyFollowers(){
       await scroller()
       timeout(3000)
       scrollme = 0
       while(scrollme < numOfFollowers){
        await scroller()
        timeout(3000)
        dalist = await getProfiles()
        scrollme = dalist.length
        console.log(scrollme)
       }
       return getProfiles()
      }
      profList = await getAllMyFollowers()
      profiles = profList.map(x => x.split("\n")[0])

      return profiles

    }


    async function mapOverPics(myPage, aProfile, asyncFunc){

      let profilePage = 'https://www.instagram.com/' + aProfile
      
      const aTab = await myPage.browser().newPage();
      await aTab.goto(profilePage);
      picUrlArr = await scrapeInfiniteScroll(aTab, extractItems, 10)
      numOfPostedPics = await aTab.evaluate(() => {
        return document
        .querySelector('#react-root > section > main > div > header > section > ul > li:nth-child(1)')
        .innerText.split(" ")[0]
      })
      
      
      aTab.close()
      
       // you have a quite similar function up there called
       // timeout give it a check and maybe keep one
      function delay(t, data) {
        return new Promise(resolve => {
            setTimeout(resolve.bind(null, data), t);
        });
      }
      
      
           if(picUrlArr.length > 100){
              picUrlArr = picUrlArr.slice(0, 10)
          
          } 
          // this is a kind of delayed async map operation
          function recurse(array) {
            results = []
            let index = 0;
            function next() {
                if (index < array.length) {
                    return asyncFunc(array[index++], index).then(function(res) {
                      results.push(res)
                        return delay(100).then(next);
                    });
                } else {return results}        
            }
            return Promise.resolve().then(next);
        }
      
        return recurse(picUrlArr.slice(0, 10))
        
      
      }

      async function autoScroll(page){
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
      
                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
      }

      async function rqstAsync(elem, idx){
        return request(elem).pipe(fs.createWriteStream('picDB/'+ aProfile + ''+ idx +'.png'))
      }
      
      async function printToConsole(elem, idx){
        return console.log(elem)
      
      }

      async function returnIntact(elem, idx){
        return elem
      }

      async function sexyness_level(pic){
        return sightengine.check(['nudity']).set_url(pic)
      }

      async function begin(){
        const browserHandfle = await puppeteer.launch({headless: false, slowMo: 100});
        const page = await browser.newPage();
        return {tab: page, browser: browserHandle}

      }
      
exports.autoScroll = autoScroll
exports.sexyness_level = sexyness_level
exports.returnIntact = returnIntact
exports.rqstAsync = rqstAsync
exports.printToConsole = printToConsole
exports.mapOverPics = mapOverPics
exports.listFollowers = listFollowers
exports.logMeIn = logMeIn
exports.search = search
exports.extractItems = extractItems
exports.scrapeInfiniteScroll = scrapeInfiniteScroll
exports.mapStep_downloadFileAsync = mapStep_downloadFileAsync
exports.recurse = recurse
exports.delay = delay