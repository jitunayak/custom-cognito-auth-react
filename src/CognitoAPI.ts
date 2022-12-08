import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

import { IdentityPoolId, UserPoolClientId, UserPoolId } from "../stack.json";

const identityPoolId = IdentityPoolId; // IdentityPoolId
const identityProvider = `cognito-idp.ap-south-1.amazonaws.com/${UserPoolId}`;
const userPoolId = UserPoolId; // UserPoolId
const clientId = UserPoolClientId; // UserPoolClientId
const region = "ap-south-1";

const userPool = new CognitoUserPool({
  UserPoolId: userPoolId,
  ClientId: clientId,
});

const buildErrorPayload = (error: any) => {
  return {
    statusCode: 500,
    body: JSON.stringify(
      {
        error: error,
      },
      null,
      2
    ),
  };
};

const buildSuccessPayload = (result: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        credentials: result,
      },
      null,
      2
    ),
  };
};

let attributeList: any = [];

const dataEmail = {
  Name: "email",
  Value: "email@mydomain.com",
};

var attributeEmail = new CognitoUserAttribute(dataEmail);

async function createNewAccount(username: string, password: string) {
  return new Promise(
    async (resolve, reject) =>
      await userPool.signUp(
        username,
        password,
        [
          new CognitoUserAttribute({ Name: "email", Value: username }),
          new CognitoUserAttribute({ Name: "name", Value: username }),
        ],
        [
          new CognitoUserAttribute({ Name: "email", Value: username }),
          new CognitoUserAttribute({ Name: "name", Value: username }),
        ],
        function (err, result) {
          if (err) {
            console.log({ err });
            reject(err);
          }
          var cognitoUser = result?.user;
          console.log("user name is " + cognitoUser?.getUsername());
          resolve(result?.user);
        }
      )
  );
}

async function createCredentialsFromToken(idToken: string) {
  const cognito = fromCognitoIdentityPool({
    clientConfig: {
      region,
    },
    identityPoolId,
    logins: {
      [identityProvider]: idToken,
    },
  });

  return cognito();
}

async function login(username: string, password: string) {
  const authenticationData = {
    Username: username,
    Password: password,
  };

  const authenticationDetails = new AuthenticationDetails(authenticationData);
  const userPool = new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  });
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: async function (authDetails) {
        console.log({ authDetails });
        const idToken = authDetails.getIdToken().getJwtToken();
        console.log("Id Token generated from user cred", { idToken });
        const awsCredentials = await createCredentialsFromToken(idToken);
        sessionStorage.setItem("AWSCred", JSON.stringify(awsCredentials));
        sessionStorage.setItem(
          "UserDetails",
          JSON.stringify({ email: username })
        );

        resolve(buildSuccessPayload(idToken));
      },
      onFailure: function (error) {
        console.log(
          "failed to authenticate the user ",
          JSON.stringify(error, null, 2)
        );
        reject(buildErrorPayload(error));
      },
    });
  });
}

async function verifyOtpFromEmail(username: string, otp: string) {
  const userData = { Username: username, Pool: userPool };
  const cognitoUser = new CognitoUser(userData);
  console.log(cognitoUser.getUserData);
  console.log({ otp }, "", { username });
  return new Promise((resolve, reject) =>
    cognitoUser.confirmRegistration(otp, true, function (err, result) {
      if (err) {
        alert(err.message || JSON.stringify(err));
        reject(err);
      }
      console.log("verified:", result);
      resolve(result);
    })
  );
}

async function refreshAwsCredentials() {
  const userDetailsString = sessionStorage.getItem("UserDetails");
  if (!userDetailsString) {
    throw new Error("UserDetails not present");
  }
  const userDetails = JSON.parse(userDetailsString);
  const userData = { Username: userDetails.email, Pool: userPool };
  const cognitoUser = new CognitoUser(userData);

  const session = (await new Promise((resolve, reject) =>
    cognitoUser.getSession((error: any, session: any) => {
      if (error) {
        reject(error);
      }
      resolve(session);
    })
  )) as CognitoUserSession;

  const refreshToken = session.getRefreshToken();

  cognitoUser.refreshSession(refreshToken, async (err, session) => {
    if (err) {
      alert("failed to refresh token");
    }
    console.log({ session });
    const credential = await createCredentialsFromToken(
      session.idToken.jwtToken
    );
    sessionStorage.setItem("AWSCred", JSON.stringify(credential));
  });
}
export { login, createNewAccount, verifyOtpFromEmail, refreshAwsCredentials };
