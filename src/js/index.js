import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, update } from "firebase/database";

const appSettings = {
   databaseURL: 'https://endorsement-app-4843d-default-rtdb.asia-southeast1.firebasedatabase.app/'
};
const app = initializeApp(appSettings);
const database = getDatabase(app);
const endorsementListInDB = ref(database, 'endorsementList');


const toEl = document.querySelector('#to-el')
const textareaEl = document.querySelector('#textarea-el');
const fromEl = document.querySelector('#from-el')
const publishBtn = document.querySelector('#publish-btn');
const ulEl = document.querySelector('#ul-el');

publishBtn.addEventListener('click', function () {
   const toValue = toEl.value
   const textareaValue = textareaEl.value
   const fromValue = fromEl.value

   errorMessage(toValue, textareaValue, fromValue)
})

onValue(endorsementListInDB, function (snapshot) {
   if (snapshot.exists()) {
      let itemsArray = Object.entries(snapshot.val())

      clearUlEl()

      for (let i = 0; i < itemsArray.length; i++) {
         let currentItem = itemsArray[i]

         appendItemToUlEl(currentItem)
      }
   } else {
      ulEl.textContent = 'There are no endorsements...'
   }
})

function appendItemToUlEl(item) {
   let itemId = item[0]
   let itemValue = item[1]

   let newLi = document.createElement('li')

   newLi.innerHTML = `
      <p>To: ${itemValue.to}</p>
      <p>${itemValue.message}</p>
      <div class='endorsement__footer endorsement-footer'>
         <p>From: ${itemValue.from}</p>
         <div class='endorsement-footer__like'>
            <div class='endorsement-footer__img'>
               <img src='img/like.svg' alt='like icon'>
            </div>
            <span>${itemValue.likes || 0}</span>
         </div>
      </div>
   `
   ulEl.append(newLi)

   newLi.addEventListener('dblclick', function () {
      changeLikeStatus(itemValue, itemId)
   })
   
   newLi.querySelector('.endorsement-footer__like').addEventListener('click', function () {
      changeLikeStatus(itemValue, itemId)
   })
}

function changeLikeStatus(itemValue, itemId) {
   const currentLikes = itemValue.likes || 0
   const newLikes = itemValue.liked ? currentLikes - 1 : currentLikes + 1

   updateLikesInDB(itemId, newLikes, !itemValue.liked)
}

function updateLikesInDB(itemId, likes, liked) {
   const itemRef = ref(database, `endorsementList/${itemId}`)
   update(itemRef, { likes, liked })
}

function clearInputFields() {
   toEl.value = ''
   textareaEl.value = ''
   fromEl.value = ''
}

function clearUlEl() {
   ulEl.textContent = ''
}

function errorMessage(to, textarea, from) {
   if (to && textarea && from) {
      const endorsementData = {
         to: to,
         message: textarea,
         from: from,
         likes: 0,
         liked: false
      }
      push(endorsementListInDB, endorsementData)
      clearInputFields()
   } else {
      alert('Please fill in all fields before publishing.')
   }
}