import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useRef, useState } from 'react';

firebase.initializeApp({
  apiKey: "AIzaSyBlcIywhymQk0iV0biHSrmc6RY9Uzr2GaY",
  authDomain: "superchatgian.firebaseapp.com",
  projectId: "superchatgian",
  storageBucket: "superchatgian.appspot.com",
  messagingSenderId: "771243165484",
  appId: "1:771243165484:web:4105cff7b01620821a0e89",
  measurementId: "G-SHDDCGSSY5"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

export default function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        {user ? <SignOut /> : <p>hi</p>}
      </header>

      <div>
        {user ? <ChatRoom /> : <SignIn />}
      </div>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>   
  );
}

function SignOut() {

  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {

  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
        <button type='submit'>Send</button>
      </form>
    </>
  )
}

function ChatMessage(props) {

  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="" />
      <p>{ text }</p>
    </div>
  )
}