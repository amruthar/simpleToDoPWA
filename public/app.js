
if ('serviceWorker' in navigator) {
  if (navigator.serviceWorker.controller) {
          console.log('[PWA Builder] active service worker found, no need to register')
  } else {
      window.addEventListener('load', () =>
    navigator.serviceWorker.register('sw.js')
      .then(registration =>  {
        console.log('Service Worker registered')

      }).catch(err => 'SW registration failed'));
  }

} else {
  console.log("'serviceWorker' in navigator")
}

const login = document.querySelector('#firebaseui-auth-container');
const logout = document.querySelector('#logout');
const todos = document.querySelector('#todos');
const welcome = document.querySelector('#welcome');

const settings = {/* your settings... */ timestampsInSnapshots: true};

const firestore = firebase.firestore();

firestore.settings(settings);
var db = firebase.firestore();

db.enablePersistence()
  .catch(function(err) {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a a time.
        // ...
        console.log(err)
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
        // ...
        console.log(err)
    }
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    console.log("auth change: ", user)
  } else {
    // No user is signed in.
    console.log("auth change : no user")
  }
});

// Disable deprecated features


var docRef

window.addEventListener('load', e => {

  var user = localStorage.getItem("user");
  console.log(user)

  if(!user) {
    console.log("to sign in")
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start(login, {
      callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
          localStorage.setItem("user", authResult.user.email);
          console.log(firebase.auth().currentUser);
          console.log("$$$$$$$$$$$$$$$$$$$")
          var welcomeContent = `Hi ${authResult.user.email}`;
          $(welcome).html(welcomeContent)
          docRef = db.collection("ToDos").doc(authResult.user.email);
          docRef.onSnapshot(function(doc) {
              console.log("on snapshot")
              getToDos(authResult.user.email)
          });
          addLogoutButtonAndHandler();
         

        },
        uiShown: function() {
        //$("#login").html("")
         //document.getElementById('firebaseui-auth-container').style.display = 'none';
        }
      },
      signInFlow: 'popup',
      signInOptions : [
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          scopes: [
            'https://www.googleapis.com/auth/plus.login'
          ],
          customParameters: {
            prompt: 'select_account'
          }
        }
      ]
    });
  } else {
      console.log(firebase.auth().currentUser);
      console.log("user: ")
      console.log(user)
      var welcomeContent = `Hi ${user}`;
      $(welcome).html(welcomeContent)
      docRef = db.collection("ToDos").doc(user);
      docRef.onSnapshot(function(doc) {
          console.log("on snapshot")
          getToDos(user)
      });
      addLogoutButtonAndHandler();
  }
  
});
var addLogoutButtonAndHandler = function() {
  var logoutDivContent = `<button type="button" id="logoutBtn"  >Logout</button>`;
   $(logout).html(logoutDivContent)
   var elem = document.querySelector("#logoutBtn");
   $(elem).click(function(event) {
    firebase.auth().signOut().then(function() {
      console.log("sign out successful")
      localStorage.removeItem('user');
      location.reload()
    }).catch(function(error) {
      // An error happened.
      console.log(error)
      localStorage.removeItem('user');
      location.reload()
    });
   });

};

var attachHandlersToTextBoxes = function() {
      var toDoTexts = document.getElementsByClassName("toDoText");
      console.log(toDoTexts.length)
      for(var i=0; i<toDoTexts.length; i++) {
        var eId = '#'+toDoTexts[i].attributes[1].value
        var elem = document.querySelector(eId);
         $(elem).on('focusin', function(){
          $(this).data('oldValue', $(this).val());
         });
         $(elem).on('input propertychange paste ', _.debounce(function(event){
          var elemId = event.target.id
          if(elemId === "toDo_new") { 
            if(event.target.value !== null && event.target.value !== "") {
              if(toDoTexts.length === 1) {
              docRef.set({"toDos": [{checked : false, name: event.target.value}]});
            } else {
                docRef.update({
                toDos: firebase.firestore.FieldValue.arrayUnion({checked : false, name: event.target.value})
              });
            }
            }
            

            
          } else {

            var checkBoxId = "#checkBox" + elemId.substring(elemId.indexOf('_'),elemId.length);
            var isChecked = $(checkBoxId).prop("checked");
            var oldValue = $(this).data("oldValue")
            var value = event.target.value
            if(oldValue !== value) {
              if(value && value.trim() !== "") {
                console.log({checked : isChecked, name: oldValue})
                docRef.update({
                  toDos: firebase.firestore.FieldValue.arrayRemove({checked : isChecked, name: oldValue})
                });
                 console.log({checked : isChecked, name: event.target.value})
                docRef.update({
                  toDos: firebase.firestore.FieldValue.arrayUnion({checked : isChecked, name: event.target.value})
                });
              } else if(value === ""){
                docRef.update({
                  toDos: firebase.firestore.FieldValue.arrayRemove({checked : isChecked, name: oldValue})
                });
              }
            }
            
            
          }
        },2000));
      }
      console.log("attachHandlersToTextBoxes")
}

var attachHandlersToCheckBoxes = function() {

      var toDoCheckBoxes = document.getElementsByClassName("toDoCheckBox");
      for(var i=0; i<toDoCheckBoxes.length; i++) {
        var eId = '#'+toDoCheckBoxes[i].attributes[1].value
        var elem = document.querySelector(eId);
         $(elem).click(function(event){
          var elemId = "#"+event.target.id
          if(elemId === "#checkBox_new") {
            $(elemId).prop('checked', false);
            alert("Please add an item before you can check it")
          } else {
            var textBoxId = "#toDo" + elemId.substring(elemId.indexOf('_'),elemId.length);
            var name = $(textBoxId).val();
            var newValue = ($(elemId).prop("checked"));
            var value = event.target.value
              console.log({checked : !newValue, name: name})
              docRef.update({
                toDos: firebase.firestore.FieldValue.arrayRemove({checked : !newValue, name: name})
              });
               console.log({checked : newValue, name: name})
              docRef.update({
                toDos: firebase.firestore.FieldValue.arrayUnion({checked : newValue, name: name})
              });
          }
        });
         
      }
      console.log("attachHandlersToCheckBoxes")
}



var getToDos = function(mailId) {
  
  docRef.get().then(function(doc) {
    if (doc.exists) {
      var toDos = doc.data().toDos;
      console.log(toDos)
      var preparedToDos = toDos.map(prepareToDo).join('\n') 
      + `<div class="toDo">
            <input type="checkbox" id="checkBox_new" class="toDoCheckBox" disabled>
            <input type="text" id="toDo_new" class="toDoText"><div id="helper">add item</div>
            <br>
        </div>`;
      $(todos).html(preparedToDos)
      attachHandlersToTextBoxes()
      attachHandlersToCheckBoxes()
    } else {
        // doc.data() will be undefined in this case
        var preparedToDos = `<div class="toDo">
            <input type="checkbox" id="checkBox_new" class="toDoCheckBox" disabled>
            <input type="text" id="toDo_new" class="toDoText"><div id="helper">add item</div>
            <br>
        </div>`;
      $(todos).html(preparedToDos)
        console.log("No such document!");
        attachHandlersToTextBoxes()
        attachHandlersToCheckBoxes()
    }
  }).catch(function(error) {
    var preparedToDos = `<div class="toDo">
            <input type="checkbox" id="checkBox_new" class="toDoCheckBox" disabled>
            <input type="text" id="toDo_new" class="toDoText"><div id="helper">add item</div>
            <br>
        </div>`;
      $(todos).html(preparedToDos)
      console.log("Error getting document:", error);
      attachHandlersToTextBoxes()
      attachHandlersToCheckBoxes() 
  });
}






function prepareToDo(toDo, index, toDos) {
  var checked = ""
  var checkedClass = ""
  if(toDo.checked) {
    checked = "checked"
    checkedClass = " toDoChecked"
  }
  return `
    <div class="toDo">
    <input type="checkbox" id="checkBox_${index}" class="toDoCheckBox"  ${checked}>
    <input type="text" id="toDo_${index}" class="toDoText${checkedClass}" 
    value="${toDo.name}">
    <br>
    </div>
  `;
}
