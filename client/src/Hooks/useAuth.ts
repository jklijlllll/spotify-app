import { useState, useEffect } from "react";
import axios from "axios";

export default function useAuth(code: string) {
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [expiresAt, setExpiresAt] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [codeLoading, setCodeLoading] = useState<boolean>(false);
    
    useEffect(() => {

        if (localStorage.getItem("expiresAt") !== null) {
            const localExpiresAt = JSON.parse(localStorage.getItem("expiresAt")!) ;
            if(Date.now() >= localExpiresAt) {
                setLoading(false);
                return;
            }
            setExpiresAt(JSON.parse(localExpiresAt));
        }

   
        if (localStorage.getItem("accessToken") !== null) {
            setAccessToken(JSON.parse(localStorage.getItem("accessToken")!));
        }

         
        if (localStorage.getItem("refreshToken") !== null) {
            setRefreshToken(JSON.parse(localStorage.getItem("refreshToken")!));
        }
        
        setLoading(false);
    }, [])

    const logOut = () => {
        localStorage.removeItem("expiresAt");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAccessToken("");
        setRefreshToken("");
        setExpiresAt(0);
    }

    useEffect(() => {
        window.addEventListener("logout", logOut);

        return () => {
            window.removeEventListener("logout", logOut);
        }
    },[])

    useEffect(() => {
        
        if (code !== null) {
            setCodeLoading(true);
            axios.post("http://localhost:5000/auth/login", {
                code, 
            }).then (res => {
                setAccessToken(res.data.accessToken);
                setRefreshToken(res.data.refreshToken);
                setExpiresAt(Date.now() + ((res.data.expiresIn - 60) * 1000));  
                setLoading(false);
                
                localStorage.setItem("accessToken", JSON.stringify(res.data.accessToken));
                localStorage.setItem("refreshToken", JSON.stringify(res.data.refreshToken));
                localStorage.setItem("expiresAt", JSON.stringify(Date.now() + ((res.data.expiresIn - 60) * 1000)));
                window.history.pushState({}, null!, "/");
            }).catch(() => {
                (window as Window).location = "/";
            })
        }
        
    },[code])

    useEffect(() => {
        if (!codeLoading) return;
        if (accessToken === "") return;
        setCodeLoading(false);
    },[codeLoading, accessToken])

    useEffect(() => {
        if (!refreshToken || !expiresAt) return
        const refresh = setTimeout(() => {
          axios
            .post("http://localhost:5000/auth/refresh", {
              refreshToken,
            })
            .then(res => {

              setAccessToken(res.data.accessToken)
              setExpiresAt(Date.now() + ((res.data.expiresIn - 60) * 1000));
              localStorage.setItem("accessToken", JSON.stringify(res.data.accessToken));
              localStorage.setItem("expiresAt", JSON.stringify(Date.now() + ((res.data.expiresIn - 60) * 1000)));

              if (res.data.refreshToken) {
                setRefreshToken(res.data.refreshToken);
              localStorage.setItem("refreshToken", JSON.stringify(res.data.refreshToken));
              }
              
            })
            .catch(() => {
                (window as Window).location = "/";
            })
        }, expiresAt - Date.now())
    
        return () => clearTimeout(refresh);
      }, [refreshToken, expiresAt])


    return {accessToken, loading, codeLoading};
}