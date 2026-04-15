import { auth } from "../../firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

window.login = async function(){
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  try{
    await signInWithEmailAndPassword(auth, email, pass);
    go("modules/dashboard/dashboard.html");
  }catch(e){
    alert(e.message);
  }
}