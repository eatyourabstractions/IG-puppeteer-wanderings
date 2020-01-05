const gram = require('./IGUtils');

async function telecharger(user, pass, ...qtysAndTags){
        const debut = await gram.begin()
        const browser = debut.browser
        const mypage = debut.tab

        console.log('quantities and tags: ' + qtysAndTags)
   
        await gram.logMeIn(mypage, user, pass)
        gram.checkDirectory()

    async function download(tab, quantity, tag){
          await gram.search(tab, tag)
          pic_url_array = await gram.scrapeInfiniteScroll(tab, gram.extractItems, quantity)
          
          picArr = pic_url_array.slice(0, quantity)
          var tagDir = "picDB/" + tag + "/"
          gram.checkDirectory(tagDir)
      
          downloadFunc = gram.downloadAsync(tagDir)
          await gram.loop(picArr, downloadFunc)
    }

    async function execute(){
      var chunks = chunkArray(qtysAndTags[0], 2)
      for (idx = 0; idx < chunks.length; idx++){
        console.log(chunks[idx][1])
        await download(mypage, chunks[idx][0], chunks[idx][1])
          }
          return
    }
    await execute()

    browser.close()

    }

exports.telecharger = telecharger

function chunkArray(myArray, chunk_size){
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];
  
  for (index = 0; index < arrayLength; index += chunk_size) {
      myChunk = myArray.slice(index, index+chunk_size);
      // Do something if you want with the group
      tempArray.push(myChunk);
  }

  return tempArray;
}


