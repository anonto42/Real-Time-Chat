import React, { useState } from 'react'
import { Avatar, Button, Container, IconButton, Paper, Stack, TextField, Typography } from "@mui/material"
import { CameraAlt as CamaraAltIcon } from '@mui/icons-material'
import { VisuallyHidden } from '../Components/styles/StyledCompo'
import { useFileHandler, useInputValidation , useStrongPassword} from "6pp";
import { userNameValidator } from '../utils/usernameValidator';
import axios from 'axios';
import { server } from '../libs/config';
import { useDispatch } from 'react-redux';
import { userExists } from '../redux/reducer/auth';
import toast from 'react-hot-toast';

const Auth = () => {

  const [isLogin,setIsLogin] = useState(true);
  const name = useInputValidation("");
  const userName = useInputValidation("",userNameValidator);
  const password = useStrongPassword("");
  const avatar = useFileHandler("single");
  const toogleLogin = () => setIsLogin(!isLogin);
  const dispatch = useDispatch()

  const config = {
        withCredentials: true,
        headers:{
          "Content-Type":"application/json"
        }
      };

  const handerSignup = async (e) =>{
    e.preventDefault();
    try {
      const data = {
        name: name.value,
        userName: userName.value,
        password: password.value,
        avatar: avatar.file
      }
      const response = await axios.post(`${server}/api/userCreate`, data , config)

      if(response.data.success == true) {
        toast.success("User Created Successfully")
        setTimeout(() => {
          window.location.href = "/"
        }, 3000);
      }else{
        toast.error(response.data.message)
      }
      
    } catch (error) {
      toast.error(error?.response?.data?.message || "Somthing went wrong")
    }
  }

  const handerlogin = async(e) =>{
    e.preventDefault();
    try {
      const data = await axios.post(`${server}/api/login`, {
        userName: userName.value,
        password: password.value
      },
      config
    );
    console.log(data)
    // toast.success(data)
    setTimeout(() => {
    }, 3000);

    } catch (error) {
      toast.error(error?.response?.data?.message || "Somthing went wrong")
    }
  }


  return <div style={{ backgroundImage: "linear-gradient(to right, gray , pink)"}}>
  <Container component={"main"} maxWidth="xs" sx={{display:'flex' , justifyContent:"center" , alignItems:"center",height:"100svh"}}>
      <Paper elevation={3} sx={{padding:4, display:"flex",flexDirection:"column",alignItems:"center"}} >
        {
          isLogin? (
            <>
              <Typography variant='h5'>Login</Typography>
              <form style={{ width: "100%" , marginTop:"1rem"}} action='POST' >

                <TextField required fullWidth label="UserName" margin='normal' variant='outlined' value={userName.value} onChange={userName.changeHandler} />
                 <TextField required fullWidth type='password' label="Password" margin='normal' variant='outlined'  />

                 <button onClick={handerlogin} style={{width:"100%",background:"#1565C0",outline:"none",border:"none",fontSize:"20px",color:"white",padding:"10px 0 10px 0",cursor:"pointer",borderRadius:"5px",marginTop:"10px"}}>Login</button>

                <Typography textAlign={"center"} m={"1rem"} >Or</Typography>

                <Button sx={{marginTop:'1rem'}} fullWidth variant='text' onClick={toogleLogin}>Sign Up</Button>

              </form>
            </>
          ) : ( 
            <>
            <Typography variant='h5'>Sign Up</Typography>
            <form style={{ width: "100%" , marginTop:"1rem"}} action='POST' >

              <Stack position={"relative"} width={"10rem"} margin={"auto"}>
                <Avatar sx={{width:"10rem",height:"10rem",objectFit:"contain"}} src={avatar.preview} />
                <IconButton sx={{ position:"absolute" , bottom:"0" , right:"0", color:"white", bgcolor:"rgba(0,0,0,0.5)",":hover":{bgcolor:"rgba(0,0,0,0.7)"}}} component="label">
                  <>
                    <CamaraAltIcon />
                    <VisuallyHidden type='file' onChange={avatar.changeHandler} />
                  </>
                </IconButton>
              </Stack>

                <TextField required fullWidth label="Full Name" margin='normal' variant='outlined' value={name.value} onChange={name.changeHandler} />
                <TextField required fullWidth label="UserName" margin='normal' variant='outlined' value={userName.value} onChange={userName.changeHandler} />
                {
                  userName.error && <Typography sx={{fontSize:"14px"}} color='error'>{userName.error}</Typography> 
                }
                <TextField required fullWidth type='password' label="Password" margin='normal' variant='outlined' value={password.value} onChange={password.changeHandler} />
                

                <button onClick={handerSignup} style={{width:"100%",background:"#1565C0",outline:"none",border:"none",fontSize:"20px",color:"white",padding:"10px 0 10px 0",cursor:"pointer",borderRadius:"5px",marginTop:"10px"}}>Sign Up</button>

                <Typography textAlign={"center"} m={"1rem"} >Or</Typography>

              <Button sx={{marginTop:'1rem'}} fullWidth variant='text' onClick={toogleLogin}>Login</Button>

            </form>
          </>

          )
        }
      </Paper>
  </Container>
  </div>
}

export default Auth