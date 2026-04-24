import { User } from "firebase/auth";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { auth } from "../firebase";
import { signIn, signOut } from "./auth";

type AuthData = {
  user?: User | null;
  isLoggedIn: boolean;
  handleLoginClick: () => void; 
};

const AuthUserContext = createContext<AuthData>({user: null, isLoggedIn: false, handleLoginClick: () => {}});

export default function AuthUserProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) setUser(userAuth);
      else setUser(null);
    });
  }, []);

  const handleLoginClick = async () => {
        if (user) await signOut();
        else signIn();
    };


  return (<AuthUserContext.Provider value={{user, isLoggedIn: !!user, handleLoginClick}}>{children}</AuthUserContext.Provider>);
}

export const useAuth = () => {
  const context = useContext(AuthUserContext);
  if (context == undefined) {
    throw new Error("useAuth must be used within an AuthUserProvider");
  }
  return context;
}
