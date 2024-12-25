import { Button, Modal, makeStyles, Input } from '@material-ui/core';
import React, {useState, useEffect} from 'react';
import './App.css';
import Post from './Post';
import ImageUpload from './ImageUpload';

const BASE_URL = "http://localhost:8000/"

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}`,
    left:`${left}`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles({
  paper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    backgroundColor: 'white',
    border: '2px solid #000',
    boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
    padding: '16px 32px 24px',
    borderRadius: '8px',
  },
});

function App() {
  const classes = useStyles();
  const [posts, setPosts] = useState([]);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [modalStyle, setModalStyle] = useState(getModalStyle)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authToken, setAuthToken] = useState(null)
  const [authTokenType, setAuthTokenType] = useState(null)
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [searchUsername, setSearchUsername] = useState('');
  const [searchedPosts, setSearchedPosts] = useState([]);

  useEffect(() => {
    setAuthToken(window.localStorage.getItem('authToken'))
    setAuthTokenType(window.localStorage.getItem('authTokenType'))
    setUsername(window.localStorage.getItem('username'))
    setUserId(window.localStorage.getItem('userId'))
  },[])

  useEffect(() => {
    authToken
      ? window.localStorage.setItem('authToken', authToken)
      : window.localStorage.removeItem('authToken')
    authTokenType
      ? window.localStorage.setItem('authTokenType', authTokenType)
      : window.localStorage.removeItem('authTokenType')
    username 
      ? window.localStorage.setItem('username', username)
      : window.localStorage.removeItem('username')
    userId
      ? window.localStorage.setItem('userId', userId)
      : window.localStorage.removeItem('userId')

  },[authToken, authTokenType, userId])

  useEffect(() => {
    fetch(BASE_URL + 'post/all')
      .then(respone => {
        const json = respone.json()
        console.log(json);
        if (respone.ok) {
          return json
        }
        throw respone
      })
      .then(data => {
        const result = data.sort((a,b) =>{
          const t_a = a.timestamp.split(/[-T:]/);
          const t_b = b.timestamp.split(/[-T:]/);
          const d_a = new Date(Date.UTC(t_a[0], t_a[1]-1,t_a[2], t_a[3], t_a[4], t_a[5]))
          const d_b = new Date(Date.UTC(t_b[0], t_b[1]-1,t_b[2], t_b[3], t_b[4], t_b[5]))
          return d_b - d_a
        })
        return result
      })
      .then(data => {
        setPosts(data)
      })
      .catch(error => {
        console.log(error);
        alert(error)
      })
  },[])

  const handleSearch = () => {
    if (!searchUsername.trim()) {
        alert('Please enter a username to search');
        return;
    }
    
    fetch(`${BASE_URL}post/${searchUsername}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('User not found or no posts available');
            }
            return response.json();
        })
        .then((data) => {
            // Sắp xếp bài post theo timestamp (mới nhất trước)
            const sortedPosts = data.sort((a, b) => {
                const t_a = a.timestamp.split(/[-T:]/);
                const t_b = b.timestamp.split(/[-T:]/);
                const d_a = new Date(Date.UTC(t_a[0], t_a[1] - 1, t_a[2], t_a[3], t_a[4], t_a[5]));
                const d_b = new Date(Date.UTC(t_b[0], t_b[1] - 1, t_b[2], t_b[3], t_b[4], t_b[5]));
                return d_b - d_a;
            });

            setSearchedPosts(sortedPosts);
        })
        .catch((error) => {
            console.error(error);
            alert(error.message);
        });
};

  const signIn = (event) => {
    event?.preventDefault();
    
    let formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const requestOptions = {
      method: 'POST',
      body: formData
    }
    
    fetch(BASE_URL + 'login', requestOptions)
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw response
      })
      .then(data => {
        console.log(data);
        setAuthToken(data.access_token)
        setAuthTokenType(data.token_type)
        setUserId(data.user_id)
        setUsername(data.username)
      })
      .catch(error => {
        console.log(error);
        alert(error)
      })
    setOpenSignIn(false);
  }

  const signOut = (event) => {
    setAuthToken(null)
    setAuthTokenType(null)
    setUserId('')
    setUsername('')
  }

  const signUp = (event) => {
    event?.preventDefault();

    const json_string = JSON.stringify({
      username: username,
      email: email,
      password: password
    })

    const requestOption = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: json_string
    }
    fetch(BASE_URL + 'user/', requestOption)
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw response
      })
      .then (data => {
        //console.log(data);
        signIn();
      })
      .catch (error => {
        console.log(error);
        alert(error);
      })
    setOpenSignUp(false)
  }

  return (
    <div className='app'>

      <Modal
        open={openSignIn}
        onClose={()=> setOpenSignIn(false)}>
        
        <div style={modalStyle} className={classes.paper}>
          <form className='app_signin'>
            <center>
              <img className='app_headerImage'
                src='https://t4.ftcdn.net/jpg/07/33/91/73/360_F_733917372_WX8Yvk6XkfEX9eznFpLxqwttC6d3glR4.jpg'
                alt='Instagram'/>
            </center>
            <Input
              placeholder='username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}/>
            <Input 
              placeholder='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}/>
            <Button
              type='submit'
              onClick={signIn}>Login</Button>
          </form>
        </div>

      </Modal>

      <Modal
        open={openSignUp}
        onClose={()=> setOpenSignUp(false)}>
        
        <div style={modalStyle} className={classes.paper}>
          <form className='app_signin'>
            <center>
              <img className='app_headerImage'
                src='https://t4.ftcdn.net/jpg/07/33/91/73/360_F_733917372_WX8Yvk6XkfEX9eznFpLxqwttC6d3glR4.jpg'
                alt='Instagram'/>
            </center>
            <Input
              placeholder='username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}/>
            <Input
              placeholder='email'
              type='text'
              value={email}
              onChange={(e) => setEmail(e.target.value)}/>
            <Input 
              placeholder='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}/>
            <Button
              type='submit'
              onClick={signUp}>Sign up</Button>
          </form>
        </div>

      </Modal>

      <div className='app_header'>
        <img className='app_headerImage'
          src='https://t4.ftcdn.net/jpg/07/33/91/73/360_F_733917372_WX8Yvk6XkfEX9eznFpLxqwttC6d3glR4.jpg'
          alt='Instagram'/>
        <div className='app_search'>
          <Input
            placeholder='Search posts by username'
            type='text'
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            style={{ marginRight: '10px' }}
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>
        {authToken ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px' }}>Hello {username}</span>
          <Button onClick={() => signOut()}>Logout</Button>
        </div>
        ) : (
          <div>
            <Button onClick={() => setOpenSignIn(true)}>Login</Button>
            <Button onClick={() => setOpenSignUp(true)}>Signup</Button>
          </div>
          )
        }     
      </div>

      <div className='app_post'>
        {
          searchedPosts.length > 0 ? (
            searchedPosts.map(post => (
              <Post
                key={post.id}
                post={post}
                authToken={authToken}
                authTokenType={authTokenType}
                username={username}
              />
            ))
          ) : (
            posts.map(post => (
              <Post
                key={post.id}
                post={post}
                authToken={authToken}
                authTokenType={authTokenType}
                username={username}
              />
            ))
          )
        }
      </div>

      {
        authToken ? (
          <ImageUpload
            authToken={authToken}
            authTokenType={authTokenType}
            userId={userId}
          />
        ) : (
          <h3>You need to login to upload</h3>
        )
      }
    </div>
  );
}

export default App;
