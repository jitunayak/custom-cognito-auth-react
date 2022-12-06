import { ReactNode, useEffect, useState } from "react";
import styled from "styled-components";
import "./App.css";
import {
  createNewAccount,
  login,
  refreshAwsCredentials,
  verifyOtpFromEmail,
} from "./CognitoAPI";
import InputBox from "./InputBox";
import Loader from "./Loader";
type Props = {
  children?: ReactNode;
  appName?: string;
  theme?: Record<string, string>;
};

const theme = {
  primary: "blueviolet",
};

export default function Authentication({
  children,
  appName = "Rules Engine",
}: Props) {
  const availableTabs = ["Sign in", "Create Account"];
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  let session = sessionStorage.getItem("AWSCred");
  const [currentSession, setcurrentSession] = useState(session);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedTab, setSelectedTab] = useState(availableTabs[0]);
  const [toggleVerifyOtpScreen, settoggleVerifyOtpScreen] = useState(false);
  const [registerUsername, setRegisterUsername] = useState({
    value: "",
    isError: false,
    errorMsg: "username can't be less than 3 characters",
  });
  const [registerPasswordFirst, setregisterPasswordFirst] = useState({
    value: "",
    isError: false,
    errorMsg: "Minimum 8 characters",
  });
  const [verificationOtp, setverificationOtp] = useState({
    value: "",
    isError: false,
    errorMsg: "Invalid OTP",
  });
  const [registerPasswordSecond, setregisterPasswordSecond] = useState({
    value: "",
    isError: false,
    errorMsg: "Password doesn't match",
  });

  const [emailAddress, setEmailAddress] = useState({
    value: "",
    isError: false,
    errorMsg: "Email is invalid",
  });
  const [password, setPassword] = useState({
    value: "",
    isError: false,
    errorMsg: "Minimum 8 characters",
  });

  const validateEmail = (email: string): boolean => {
    return email.length > 5 && email.endsWith(".com") && email.search("@")
      ? false
      : true;
  };

  const validatePasswordpolicy = (password: string): boolean => {
    return password.length <= 6;
  };

  const matchPassword = (): boolean =>
    registerPasswordFirst.value === registerPasswordSecond.value;

  const validateUsername = (): boolean => registerUsername.value.length < 3;

  async function handleLogin(e: any) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const awsCredential = await login(emailAddress.value, password.value);
      console.log(awsCredential);
      setIsUserAuthenticated(true);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);

      const errorType = JSON.parse(err.body).error.code;
      console.log(JSON.parse(err.body).error.code);

      if (errorType === "UserNotFoundException") {
        // alert("Please Create An Account First");
        setSelectedTab(availableTabs[1]);
        settoggleVerifyOtpScreen(false);
      }

      if (errorType === "InvalidParameterException") {
        alert("Input values are missing");
      }
      //   alert(err);
    }
  }

  async function handleRegister() {
    setIsLoading(true);

    try {
      const result = await createNewAccount(
        emailAddress.value,
        registerPasswordFirst.value
      );
      console.log(result);
      if (result) {
        setIsLoading(false);
        settoggleVerifyOtpScreen(true);
      }
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      alert(err);
    }
  }

  async function verifyOtp() {
    setIsLoading(true);

    try {
      console.log("otp", verificationOtp.value);
      const result = await verifyOtpFromEmail(
        emailAddress.value,
        verificationOtp.value
      );
      settoggleVerifyOtpScreen(false);
      if (result === "SUCCESS") {
        settoggleVerifyOtpScreen(false);
        setSelectedTab(availableTabs[0]);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);

      verificationOtp.isError = true;
      alert(err);
    }
  }

  async function checkTokenExpiry() {
    try {
      if (session) {
        const awsCred = JSON.parse(session as string);
        if (!awsCred) {
          setIsUserAuthenticated(false);
        }
        if (
          new Date(awsCred.expiration.toLocaleString()).toLocaleString() <
          new Date().toLocaleString()
        ) {
          sessionStorage.removeItem("AWSCred");
          console.log("Session expired");
          await refreshAwsCredentials();
          //   setIsUserAuthenticated(true);
          setcurrentSession(JSON.parse(sessionStorage.getItem("AWSCred")));
        }
        // else {
        //   console.log("not expired.. logging u back");
        //   setIsUserAuthenticated(true);
        // }
      }
    } catch (err) {
      sessionStorage.removeItem("AWSCred");
    }
  }

  checkTokenExpiry();

  useEffect(() => {
    console.log("refreshed...");
    // checkTokenExpiry();

    return () => {};
  }, [isUserAuthenticated]);

  if (isUserAuthenticated) return <div> {children}</div>;

  return (
    <Wrapper>
      <Title>{appName}</Title>
      <TabWrapper>
        {availableTabs.map((tab, index) => (
          <Tab
            key={index}
            onClick={() => setSelectedTab(tab)}
            isActive={selectedTab === tab}
          >
            {tab}
          </Tab>
        ))}
      </TabWrapper>
      {selectedTab === availableTabs[0] && (
        <SignInWrapper>
          <InputBox
            type="email"
            placeHolder="email"
            fieldDetails={emailAddress}
            setFieldDetails={setEmailAddress}
            validator={validateEmail}
          />
          <InputBox
            type="password"
            placeHolder="password"
            fieldDetails={password}
            setFieldDetails={setPassword}
            validator={validatePasswordpolicy}
          />
          <PrimaryButton
            isLoading={isLoading}
            onClick={async (e) => await handleLogin(e)}
          >
            {isLoading && <Loader />}
            Login
          </PrimaryButton>
          <Link>forgot password</Link>
        </SignInWrapper>
      )}
      {selectedTab === availableTabs[1] && !toggleVerifyOtpScreen && (
        <RegisterWrapper>
          <InputBox
            type="email"
            placeHolder="email"
            fieldDetails={emailAddress}
            setFieldDetails={setEmailAddress}
            validator={validateEmail}
          />
          <InputBox
            type="text"
            placeHolder="username"
            fieldDetails={registerUsername}
            setFieldDetails={setRegisterUsername}
            validator={validateUsername}
          />
          <InputBox
            type="password"
            placeHolder="password"
            fieldDetails={registerPasswordFirst}
            setFieldDetails={setregisterPasswordFirst}
            validator={validatePasswordpolicy}
          />

          <InputBox
            type="password"
            placeHolder="re-password"
            fieldDetails={registerPasswordSecond}
            setFieldDetails={setregisterPasswordSecond}
            validator={matchPassword}
          />
          <PrimaryButton
            isLoading={isLoading}
            onClick={async () => await handleRegister()}
          >
            Register
          </PrimaryButton>
        </RegisterWrapper>
      )}
      {selectedTab === availableTabs[1] && toggleVerifyOtpScreen && (
        <>
          <InputBox
            type="number"
            placeHolder="OTP"
            fieldDetails={verificationOtp}
            setFieldDetails={setverificationOtp}
          />
          <PrimaryButton
            isLoading={isLoading}
            onClick={async () => await verifyOtp()}
          >
            Verify
          </PrimaryButton>
        </>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: "white";
  padding: 1rem;
  border-radius: 0.4rem;
  border: 0.6px grey solid;
  box-shadow: 6px 8px;
`;

const TabWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0.4rem;
`;

const Title = styled.h2`
  color: ${theme.primary};
`;

const Tab = styled.div`
  font-size: 1.5em;
  text-align: center;
  cursor: pointer;
  border-radius: 0.2rem;
  margin: 1rem 0rem;
  padding: 0.6rem 1rem;
  :hover {
    animation: fade 2s infinite;
  }
  transition: background-color 0.5s;

  @media (prefers-color-scheme: dark) {
    color: ${(props: { isActive?: boolean }) =>
      !props.isActive ? "white" : "black"};
    background-color: ${(props: { isActive?: boolean }) =>
      props.isActive ? "white" : "black"};
  }
  @media (prefers-color-scheme: light) {
    color: ${(props: { isActive?: boolean }) =>
      !props.isActive ? "black" : "white"};
    background-color: ${(props: { isActive?: boolean }) =>
      props.isActive ? "black" : "white"};
  }
`;

const PrimaryButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.2rem;
  background-color: ${theme.primary};
  color: white;
  font-weight: 500;
  font-size: 1.2rem;
  margin: 0.6rem 0.5rem;
  opacity: ${(props: { isLoading: boolean }) => (props.isLoading ? 0.8 : 1)};
  cursor: pointer;

  :hover {
    transition: opacity 0.25s;
    opacity: 0.8;
  }
`;

const Link = styled.a`
  cursor: pointer;
`;

const SignInWrapper = styled.form`
  display: flex;
  flex-direction: column;
  width: auto;
`;
const RegisterWrapper = styled(SignInWrapper)``;
