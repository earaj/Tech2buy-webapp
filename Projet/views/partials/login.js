import { GoogleLogin } from 'react-google-login';

const clientId = "842047957065-6t4t5dba6dbc02ljft6mrditoemap9sf.apps.googleusercontent.com"



function Login(){

    const onSuccess = (res) => {
        console.log("LOGIN SUCCESS! BIENVENUE: ", res.profilObj);
    }
    
    const onFailure = (res) => {
        console.log("LOGIN FAILED! RES:", res);
    }

    return(
        <div id="signInButton">
            <GoogleLogin
                clientId={clientId}
                buttonText="Se connecter avec google"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                isSignedIn={true}
            />
        </div>
    )

}

export default Login;